import express from 'express';
import admin from 'firebase-admin';
//import { admin } from "../firebase/config.js";
import { body, validationResult } from 'express-validator';

const router = express.Router();

/**
 * Create a new bug report
 * POST /api/bugs
 */
router.post('/', [
  body('title').isString().isLength({ min: 5, max: 200 }),
  body('description').isString().isLength({ min: 10, max: 2000 }),
  body('severity').isIn(['low', 'medium', 'high', 'critical']),
  body('category').isIn(['ui', 'api', 'performance', 'security', 'data', 'other']),
  body('stepsToReproduce').optional().isString().isLength({ max: 1000 }),
  body('expectedBehavior').optional().isString().isLength({ max: 500 }),
  body('actualBehavior').optional().isString().isLength({ max: 500 }),
  body('environment').optional().isObject(),
  body('attachments').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const {
      title,
      description,
      severity,
      category,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      environment = {},
      attachments = []
    } = req.body;

    const reporterId = req.user.uid;

    // Get reporter information
    const reporterDoc = await admin.firestore()
      .collection('users')
      .doc(reporterId)
      .get();

    const reporterData = reporterDoc.exists ? reporterDoc.data() : {};

    const bugData = {
      id: admin.firestore().collection('bugs').doc().id,
      title,
      description,
      severity,
      category,
      status: 'open',
      priority: calculatePriority(severity, category),
      reporterId,
      reporterName: reporterData.displayName || reporterData.email || 'Unknown',
      reporterEmail: reporterData.email || '',
      assignedTo: null,
      assignedToName: null,
      stepsToReproduce: stepsToReproduce || '',
      expectedBehavior: expectedBehavior || '',
      actualBehavior: actualBehavior || '',
      environment: {
        browser: environment.browser || '',
        os: environment.os || '',
        device: environment.device || '',
        version: environment.version || '',
        userAgent: req.get('User-Agent') || '',
        ...environment
      },
      attachments,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      resolvedAt: null,
      comments: [],
      tags: [],
      votes: 0,
      watchers: [reporterId]
    };

    const docRef = await admin.firestore()
      .collection('bugs')
      .add(bugData);

    // Create activity log entry
    await admin.firestore()
      .collection('bug_activities')
      .add({
        bugId: docRef.id,
        action: 'created',
        userId: reporterId,
        userName: reporterData.displayName || reporterData.email || 'Unknown',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          title,
          severity,
          category
        }
      });

    res.status(201).json({
      success: true,
      bug: {
        id: docRef.id,
        ...bugData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Bug report created successfully'
    });

  } catch (error) {
    console.error('Create bug error:', error);
    res.status(500).json({
      error: 'Failed to create bug report',
      message: error.message
    });
  }
});

/**
 * Get all bug reports with filtering and pagination
 * GET /api/bugs
 */
router.get('/', async (req, res) => {
  try {
    const {
      status = 'all',
      severity = 'all',
      category = 'all',
      assignedTo = 'all',
      reporter = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
      search = ''
    } = req.query;

    let query = admin.firestore().collection('bugs');

    // Apply filters
    if (status !== 'all') {
      query = query.where('status', '==', status);
    }
    if (severity !== 'all') {
      query = query.where('severity', '==', severity);
    }
    if (category !== 'all') {
      query = query.where('category', '==', category);
    }
    if (assignedTo !== 'all') {
      query = query.where('assignedTo', '==', assignedTo);
    }
    if (reporter !== 'all') {
      query = query.where('reporterId', '==', reporter);
    }

    // Apply sorting
    const sortField = sortBy === 'priority' ? 'priority' : 
                     sortBy === 'updated' ? 'updatedAt' : 'createdAt';
    query = query.orderBy(sortField, sortOrder);

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.get();
    let bugs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      resolvedAt: doc.data().resolvedAt?.toDate?.()?.toISOString() || null
    }));

    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      bugs = bugs.filter(bug => 
        bug.title.toLowerCase().includes(searchTerm) ||
        bug.description.toLowerCase().includes(searchTerm) ||
        bug.reporterName.toLowerCase().includes(searchTerm)
      );
    }

    res.json({
      bugs,
      total: bugs.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
      filters: { status, severity, category, assignedTo, reporter }
    });

  } catch (error) {
    console.error('Get bugs error:', error);
    res.status(500).json({
      error: 'Failed to retrieve bug reports',
      message: error.message
    });
  }
});

/**
 * Get a specific bug report
 * GET /api/bugs/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bugDoc = await admin.firestore()
      .collection('bugs')
      .doc(id)
      .get();

    if (!bugDoc.exists) {
      return res.status(404).json({
        error: 'Bug report not found',
        message: 'The specified bug report does not exist'
      });
    }

    const bugData = bugDoc.data();

    // Get activity log
    const activitiesSnapshot = await admin.firestore()
      .collection('bug_activities')
      .where('bugId', '==', id)
      .orderBy('timestamp', 'desc')
      .get();

    const activities = activitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || null
    }));

    res.json({
      id: bugDoc.id,
      ...bugData,
      createdAt: bugData.createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: bugData.updatedAt?.toDate?.()?.toISOString() || null,
      resolvedAt: bugData.resolvedAt?.toDate?.()?.toISOString() || null,
      activities
    });

  } catch (error) {
    console.error('Get bug error:', error);
    res.status(500).json({
      error: 'Failed to retrieve bug report',
      message: error.message
    });
  }
});

/**
 * Update a bug report
 * PUT /api/bugs/:id
 */
router.put('/:id', [
  body('title').optional().isString().isLength({ min: 5, max: 200 }),
  body('description').optional().isString().isLength({ min: 10, max: 2000 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('category').optional().isIn(['ui', 'api', 'performance', 'security', 'data', 'other']),
  body('status').optional().isIn(['open', 'in_progress', 'resolved', 'closed', 'duplicate']),
  body('assignedTo').optional().isString(),
  body('tags').optional().isArray(),
  body('stepsToReproduce').optional().isString().isLength({ max: 1000 }),
  body('expectedBehavior').optional().isString().isLength({ max: 500 }),
  body('actualBehavior').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.uid;
    const updateData = req.body;

    const bugDoc = await admin.firestore()
      .collection('bugs')
      .doc(id)
      .get();

    if (!bugDoc.exists) {
      return res.status(404).json({
        error: 'Bug report not found',
        message: 'The specified bug report does not exist'
      });
    }

    const bugData = bugDoc.data();

    // Check permissions (only reporter, assignee, or admin can update)
    const isReporter = bugData.reporterId === userId;
    const isAssignee = bugData.assignedTo === userId;
    // TODO: Add admin check when user roles are implemented

    if (!isReporter && !isAssignee) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You do not have permission to update this bug report'
      });
    }

    // Prepare update data
    const updates = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Track changes for activity log
    const changes = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== bugData[key]) {
        updates[key] = updateData[key];
        changes.push({
          field: key,
          oldValue: bugData[key],
          newValue: updateData[key]
        });
      }
    });

    // Handle status changes
    if (updateData.status && updateData.status !== bugData.status) {
      if (updateData.status === 'resolved' || updateData.status === 'closed') {
        updates.resolvedAt = admin.firestore.FieldValue.serverTimestamp();
      } else if (bugData.status === 'resolved' || bugData.status === 'closed') {
        updates.resolvedAt = null;
      }
    }

    // Handle assignment changes
    if (updateData.assignedTo && updateData.assignedTo !== bugData.assignedTo) {
      const assigneeDoc = await admin.firestore()
        .collection('users')
        .doc(updateData.assignedTo)
        .get();
      
      updates.assignedToName = assigneeDoc.exists ? 
        (assigneeDoc.data().displayName || assigneeDoc.data().email || 'Unknown') : 
        'Unknown';
    }

    // Update bug report
    await admin.firestore()
      .collection('bugs')
      .doc(id)
      .update(updates);

    // Create activity log entry
    if (changes.length > 0) {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      const userData = userDoc.exists ? userDoc.data() : {};

      await admin.firestore()
        .collection('bug_activities')
        .add({
          bugId: id,
          action: 'updated',
          userId,
          userName: userData.displayName || userData.email || 'Unknown',
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          details: {
            changes
          }
        });
    }

    // Get updated bug data
    const updatedBugDoc = await admin.firestore()
      .collection('bugs')
      .doc(id)
      .get();

    const updatedBugData = updatedBugDoc.data();

    res.json({
      success: true,
      bug: {
        id: updatedBugDoc.id,
        ...updatedBugData,
        createdAt: updatedBugData.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: updatedBugData.updatedAt?.toDate?.()?.toISOString() || null,
        resolvedAt: updatedBugData.resolvedAt?.toDate?.()?.toISOString() || null
      },
      message: 'Bug report updated successfully'
    });

  } catch (error) {
    console.error('Update bug error:', error);
    res.status(500).json({
      error: 'Failed to update bug report',
      message: error.message
    });
  }
});

/**
 * Add a comment to a bug report
 * POST /api/bugs/:id/comments
 */
router.post('/:id/comments', [
  body('comment').isString().isLength({ min: 1, max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.uid;

    const bugDoc = await admin.firestore()
      .collection('bugs')
      .doc(id)
      .get();

    if (!bugDoc.exists) {
      return res.status(404).json({
        error: 'Bug report not found',
        message: 'The specified bug report does not exist'
      });
    }

    const userDoc = await admin.firestore()
      .collection('users')
      .doc(userId)
      .get();

    const userData = userDoc.exists ? userDoc.data() : {};

    const commentData = {
      id: admin.firestore().collection('bug_comments').doc().id,
      bugId: id,
      userId,
      userName: userData.displayName || userData.email || 'Unknown',
      userEmail: userData.email || '',
      comment,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Add comment to bug report
    await admin.firestore()
      .collection('bugs')
      .doc(id)
      .update({
        comments: admin.firestore.FieldValue.arrayUnion(commentData),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

    // Create activity log entry
    await admin.firestore()
      .collection('bug_activities')
      .add({
        bugId: id,
        action: 'commented',
        userId,
        userName: userData.displayName || userData.email || 'Unknown',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        details: {
          comment: comment.substring(0, 100) + (comment.length > 100 ? '...' : '')
        }
      });

    res.status(201).json({
      success: true,
      comment: {
        ...commentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      message: 'Comment added successfully'
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      error: 'Failed to add comment',
      message: error.message
    });
  }
});

/**
 * Vote on a bug report
 * POST /api/bugs/:id/vote
 */
router.post('/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const bugDoc = await admin.firestore()
      .collection('bugs')
      .doc(id)
      .get();

    if (!bugDoc.exists) {
      return res.status(404).json({
        error: 'Bug report not found',
        message: 'The specified bug report does not exist'
      });
    }

    const bugData = bugDoc.data();
    const hasVoted = bugData.voters && bugData.voters.includes(userId);

    if (hasVoted) {
      // Remove vote
      await admin.firestore()
        .collection('bugs')
        .doc(id)
        .update({
          votes: admin.firestore.FieldValue.increment(-1),
          voters: admin.firestore.FieldValue.arrayRemove(userId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      res.json({
        success: true,
        action: 'unvoted',
        message: 'Vote removed successfully'
      });
    } else {
      // Add vote
      await admin.firestore()
        .collection('bugs')
        .doc(id)
        .update({
          votes: admin.firestore.FieldValue.increment(1),
          voters: admin.firestore.FieldValue.arrayUnion(userId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      res.json({
        success: true,
        action: 'voted',
        message: 'Vote added successfully'
      });
    }

  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      error: 'Failed to vote on bug report',
      message: error.message
    });
  }
});

/**
 * Watch/unwatch a bug report
 * POST /api/bugs/:id/watch
 */
router.post('/:id/watch', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const bugDoc = await admin.firestore()
      .collection('bugs')
      .doc(id)
      .get();

    if (!bugDoc.exists) {
      return res.status(404).json({
        error: 'Bug report not found',
        message: 'The specified bug report does not exist'
      });
    }

    const bugData = bugDoc.data();
    const isWatching = bugData.watchers && bugData.watchers.includes(userId);

    if (isWatching) {
      // Stop watching
      await admin.firestore()
        .collection('bugs')
        .doc(id)
        .update({
          watchers: admin.firestore.FieldValue.arrayRemove(userId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      res.json({
        success: true,
        action: 'unwatched',
        message: 'Stopped watching bug report'
      });
    } else {
      // Start watching
      await admin.firestore()
        .collection('bugs')
        .doc(id)
        .update({
          watchers: admin.firestore.FieldValue.arrayUnion(userId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      res.json({
        success: true,
        action: 'watched',
        message: 'Started watching bug report'
      });
    }

  } catch (error) {
    console.error('Watch error:', error);
    res.status(500).json({
      error: 'Failed to watch bug report',
      message: error.message
    });
  }
});

/**
 * Get bug statistics
 * GET /api/bugs/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const bugsSnapshot = await admin.firestore()
      .collection('bugs')
      .get();

    const bugs = bugsSnapshot.docs.map(doc => doc.data());

    const stats = {
      total: bugs.length,
      byStatus: {
        open: bugs.filter(bug => bug.status === 'open').length,
        in_progress: bugs.filter(bug => bug.status === 'in_progress').length,
        resolved: bugs.filter(bug => bug.status === 'resolved').length,
        closed: bugs.filter(bug => bug.status === 'closed').length,
        duplicate: bugs.filter(bug => bug.status === 'duplicate').length
      },
      bySeverity: {
        low: bugs.filter(bug => bug.severity === 'low').length,
        medium: bugs.filter(bug => bug.severity === 'medium').length,
        high: bugs.filter(bug => bug.severity === 'high').length,
        critical: bugs.filter(bug => bug.severity === 'critical').length
      },
      byCategory: {
        ui: bugs.filter(bug => bug.category === 'ui').length,
        api: bugs.filter(bug => bug.category === 'api').length,
        performance: bugs.filter(bug => bug.category === 'performance').length,
        security: bugs.filter(bug => bug.category === 'security').length,
        data: bugs.filter(bug => bug.category === 'data').length,
        other: bugs.filter(bug => bug.category === 'other').length
      },
      averageResolutionTime: calculateAverageResolutionTime(bugs),
      topReporters: getTopReporters(bugs),
      topCategories: getTopCategories(bugs)
    };

    res.json(stats);

  } catch (error) {
    console.error('Get bug stats error:', error);
    res.status(500).json({
      error: 'Failed to retrieve bug statistics',
      message: error.message
    });
  }
});

/**
 * Helper function to calculate priority based on severity and category
 */
function calculatePriority(severity, category) {
  const severityWeights = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const categoryWeights = {
    security: 4,
    data: 3,
    api: 2,
    performance: 2,
    ui: 1,
    other: 1
  };

  return severityWeights[severity] + categoryWeights[category];
}

/**
 * Helper function to calculate average resolution time
 */
function calculateAverageResolutionTime(bugs) {
  const resolvedBugs = bugs.filter(bug => bug.resolvedAt && bug.createdAt);
  
  if (resolvedBugs.length === 0) return 0;

  const totalTime = resolvedBugs.reduce((sum, bug) => {
    const created = bug.createdAt.toDate();
    const resolved = bug.resolvedAt.toDate();
    return sum + (resolved - created);
  }, 0);

  return Math.round(totalTime / resolvedBugs.length / (1000 * 60 * 60 * 24)); // days
}

/**
 * Helper function to get top reporters
 */
function getTopReporters(bugs) {
  const reporterCounts = {};
  
  bugs.forEach(bug => {
    const reporter = bug.reporterName || 'Unknown';
    reporterCounts[reporter] = (reporterCounts[reporter] || 0) + 1;
  });

  return Object.entries(reporterCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

/**
 * Helper function to get top categories
 */
function getTopCategories(bugs) {
  const categoryCounts = {};
  
  bugs.forEach(bug => {
    const category = bug.category || 'other';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  return Object.entries(categoryCounts)
    .sort(([,a], [,b]) => b - a)
    .map(([category, count]) => ({ category, count }));
}

export default router;
