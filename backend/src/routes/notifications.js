import express from 'express';
import admin from 'firebase-admin';
import { body, validationResult } from 'express-validator';
import cron from 'node-cron';

const router = express.Router();

/**
 * Send a notification to a user
 * POST /api/notifications/send
 */
router.post('/send', [
  body('userId').isString().notEmpty(),
  body('title').isString().isLength({ min: 1, max: 100 }),
  body('body').isString().isLength({ min: 1, max: 500 }),
  body('type').optional().isIn(['study_reminder', 'group_invite', 'session_reminder', 'general']),
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { userId, title, body: messageBody, type = 'general', data = {} } = req.body;
    const senderId = req.user.uid;

    // Get user's FCM token
    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      return res.status(404).json({
        error: 'User not found',
        message: 'The specified user does not exist'
      });
    }

    const userData = userDoc.data();
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      return res.status(400).json({
        error: 'FCM token not found',
        message: 'User has not registered for notifications'
      });
    }

    // Create notification payload
    const payload = {
      notification: {
        title,
        body: messageBody,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      },
      data: {
        type,
        senderId,
        timestamp: new Date().toISOString(),
        ...data
      },
      token: fcmToken
    };

    // Send notification
    const response = await admin.messaging().send(payload);

    // Save notification to database
    const notificationData = {
      id: admin.firestore().collection('notifications').doc().id,
      userId,
      senderId,
      title,
      body: messageBody,
      type,
      data,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      fcmMessageId: response
    };

    await admin.firestore()
      .collection('notifications')
      .add(notificationData);

    res.json({
      success: true,
      messageId: response,
      notification: {
        ...notificationData,
        sentAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Send notification error:', error);
    
    if (error.code === 'messaging/registration-token-not-registered') {
      return res.status(400).json({
        error: 'Invalid FCM token',
        message: 'The user\'s notification token is no longer valid'
      });
    }

    res.status(500).json({
      error: 'Failed to send notification',
      message: error.message
    });
  }
});

/**
 * Send notification to multiple users
 * POST /api/notifications/send-bulk
 */
router.post('/send-bulk', [
  body('userIds').isArray().isLength({ min: 1, max: 100 }),
  body('userIds.*').isString(),
  body('title').isString().isLength({ min: 1, max: 100 }),
  body('body').isString().isLength({ min: 1, max: 500 }),
  body('type').optional().isIn(['study_reminder', 'group_invite', 'session_reminder', 'general']),
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { userIds, title, body: messageBody, type = 'general', data = {} } = req.body;
    const senderId = req.user.uid;

    // Get FCM tokens for all users
    const userPromises = userIds.map(userId => 
      admin.firestore().collection('users').doc(userId).get()
    );
    
    const userDocs = await Promise.all(userPromises);
    const validTokens = [];
    const invalidUsers = [];

    userDocs.forEach((doc, index) => {
      if (doc.exists && doc.data().fcmToken) {
        validTokens.push({
          userId: userIds[index],
          token: doc.data().fcmToken
        });
      } else {
        invalidUsers.push(userIds[index]);
      }
    });

    if (validTokens.length === 0) {
      return res.status(400).json({
        error: 'No valid tokens found',
        message: 'None of the specified users have valid notification tokens'
      });
    }

    // Create multicast message
    const message = {
      notification: {
        title,
        body: messageBody,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      },
      data: {
        type,
        senderId,
        timestamp: new Date().toISOString(),
        ...data
      },
      tokens: validTokens.map(item => item.token)
    };

    // Send multicast notification
    const response = await admin.messaging().sendMulticast(message);

    // Save notifications to database
    const notificationPromises = validTokens.map((item, index) => {
      const notificationData = {
        id: admin.firestore().collection('notifications').doc().id,
        userId: item.userId,
        senderId,
        title,
        body: messageBody,
        type,
        data,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        read: false,
        fcmMessageId: response.responses[index].messageId
      };

      return admin.firestore()
        .collection('notifications')
        .add(notificationData);
    });

    await Promise.all(notificationPromises);

    res.json({
      success: true,
      sent: response.successCount,
      failed: response.failureCount,
      invalidUsers,
      responses: response.responses.map((resp, index) => ({
        userId: validTokens[index].userId,
        success: resp.success,
        error: resp.error?.code || null
      }))
    });

  } catch (error) {
    console.error('Send bulk notification error:', error);
    res.status(500).json({
      error: 'Failed to send bulk notifications',
      message: error.message
    });
  }
});

/**
 * Get user's notifications
 * GET /api/notifications
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 50, offset = 0, unreadOnly = false } = req.query;

    let query = admin.firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .orderBy('sentAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    if (unreadOnly === 'true') {
      query = query.where('read', '==', false);
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      sentAt: doc.data().sentAt?.toDate?.()?.toISOString() || null
    }));

    res.json({
      notifications,
      total: notifications.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to retrieve notifications',
      message: error.message
    });
  }
});

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = admin.firestore()
      .collection('notifications')
      .doc(id);

    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'The specified notification does not exist'
      });
    }

    const notificationData = doc.data();
    
    // Check if user owns this notification
    if (notificationData.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to modify this notification'
      });
    }

    // Update notification
    await docRef.update({
      read: true,
      readAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: error.message
    });
  }
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all', async (req, res) => {
  try {
    const userId = req.user.uid;

    const batch = admin.firestore().batch();
    const snapshot = await admin.firestore()
      .collection('notifications')
      .where('userId', '==', userId)
      .where('read', '==', false)
      .get();

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `Marked ${snapshot.docs.length} notifications as read`
    });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: error.message
    });
  }
});

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const docRef = admin.firestore()
      .collection('notifications')
      .doc(id);

    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'The specified notification does not exist'
      });
    }

    const notificationData = doc.data();
    
    // Check if user owns this notification
    if (notificationData.userId !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to delete this notification'
      });
    }

    await docRef.delete();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: error.message
    });
  }
});

/**
 * Register FCM token for user
 * POST /api/notifications/register-token
 */
router.post('/register-token', [
  body('fcmToken').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { fcmToken } = req.body;
    const userId = req.user.uid;

    // Update user's FCM token
    await admin.firestore()
      .collection('users')
      .doc(userId)
      .update({
        fcmToken,
        tokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    res.json({
      success: true,
      message: 'FCM token registered successfully'
    });

  } catch (error) {
    console.error('Register FCM token error:', error);
    res.status(500).json({
      error: 'Failed to register FCM token',
      message: error.message
    });
  }
});

/**
 * Schedule a study reminder
 * POST /api/notifications/schedule-reminder
 */
router.post('/schedule-reminder', [
  body('title').isString().isLength({ min: 1, max: 100 }),
  body('body').isString().isLength({ min: 1, max: 500 }),
  body('scheduledTime').isISO8601(),
  body('data').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { title, body: messageBody, scheduledTime, data = {} } = req.body;
    const userId = req.user.uid;

    const scheduledDate = new Date(scheduledTime);
    const now = new Date();

    if (scheduledDate <= now) {
      return res.status(400).json({
        error: 'Invalid scheduled time',
        message: 'Scheduled time must be in the future'
      });
    }

    // Save scheduled notification
    const reminderData = {
      userId,
      title,
      body: messageBody,
      scheduledTime: scheduledDate,
      data,
      status: 'scheduled',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await admin.firestore()
      .collection('scheduled_notifications')
      .add(reminderData);

    // Schedule the notification using cron
    const cronExpression = getCronExpression(scheduledDate);
    
    const job = cron.schedule(cronExpression, async () => {
      try {
        // Send the notification
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(userId)
          .get();

        if (userDoc.exists && userDoc.data().fcmToken) {
          const payload = {
            notification: {
              title,
              body: messageBody,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png'
            },
            data: {
              type: 'study_reminder',
              timestamp: new Date().toISOString(),
              ...data
            },
            token: userDoc.data().fcmToken
          };

          await admin.messaging().send(payload);

          // Update scheduled notification status
          await docRef.update({
            status: 'sent',
            sentAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      } catch (error) {
        console.error('Scheduled notification error:', error);
        await docRef.update({
          status: 'failed',
          error: error.message
        });
      }
    }, {
      scheduled: false
    });

    job.start();

    res.json({
      success: true,
      reminderId: docRef.id,
      scheduledTime: scheduledDate.toISOString(),
      message: 'Study reminder scheduled successfully'
    });

  } catch (error) {
    console.error('Schedule reminder error:', error);
    res.status(500).json({
      error: 'Failed to schedule reminder',
      message: error.message
    });
  }
});

/**
 * Helper function to convert date to cron expression
 */
function getCronExpression(date) {
  const minutes = date.getMinutes();
  const hours = date.getHours();
  const day = date.getDate();
  const month = date.getMonth() + 1; // Cron months are 1-based
  const year = date.getFullYear();

  return `${minutes} ${hours} ${day} ${month} *`;
}

export default router;
