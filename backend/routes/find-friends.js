import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/find-friends/recommended
 * @desc    Get recommended friends based on similar modules
 * @access  Public (no auth)
 */
router.get("/recommended", async (req, res) => {
    try {
      const userId = req.user?.uid || req.query.userId;
      const limit = parseInt(req.query.limit) || 5;
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "Missing userId"
        });
      }
  
      // 1. Fetch current user
      const currentUser = await prisma.user.findUnique({
        where: { uid: userId }
      });
  
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }
  
      // 2. Get friendships
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [{ requesterId: userId }, { receiverId: userId }]
        }
      });
  
      const excludedUserIds = new Set([userId]);
      friendships.forEach((f) => {
        if (f.status === "accepted" || f.status === "pending") {
          excludedUserIds.add(f.requesterId);
          excludedUserIds.add(f.receiverId);
        }
      });
  
      // 3. Get candidate users
      const candidates = await prisma.user.findMany({
        where: {
          uid: { notIn: Array.from(excludedUserIds) },
          isActive: true
        }
      });
  
      // 4. Rank candidates
      const ranked = candidates
        .map((candidate) => {
          let score = 0;
  
          // Shared modules scoring
          const sharedModules = candidate.modules.filter((m) =>
            currentUser.modules.includes(m)
          );
          score += sharedModules.length * 3;
  
          // Faculty match
          if (candidate.faculty === currentUser.faculty) score += 2;
  
          // Study style match
          if (
            candidate.studyPreferences?.studyStyle &&
            currentUser.studyPreferences?.studyStyle &&
            candidate.studyPreferences.studyStyle === currentUser.studyPreferences.studyStyle
          ) {
            score += 2;
          }
  
          // Study time overlap
          const candidateStudyTimes = candidate.studyPreferences?.preferredStudyTimes || [];
          const currentUserStudyTimes = currentUser.studyPreferences?.preferredStudyTimes || [];
          
          const overlapTimes = candidateStudyTimes.filter((t) =>
            currentUserStudyTimes.includes(t)
          );
          score += overlapTimes.length;
  
          return { ...candidate, sharedModules, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
  
      // 5. Respond in frontend's expected format
      res.json({
        success: true,
        data: {
          results: ranked
        }
      });
    } catch (err) {
      console.error("Error in /find-friends/recommended:", err);
      res.status(500).json({
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
});

/**
 * @route   GET /api/find-friends
 * @desc    Get user's friends list
 * @access  Public (no auth)
 */
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;
        const { status = 'accepted' } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { receiverId: userId }
                ],
                status
            },
            include: {
                requester: {
                    select: {
                        uid: true,
                        displayName: true,
                        photoURL: true,
                        university: true,
                        yearOfStudy: true,
                        faculty: true,
                        modules: true
                    }
                },
                receiver: {
                    select: {
                        uid: true,
                        displayName: true,
                        photoURL: true,
                        university: true,
                        yearOfStudy: true,
                        faculty: true,
                        modules: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const friends = friendships.map(friendship => {
            const friend = friendship.requesterId === userId 
                ? friendship.receiver 
                : friendship.requester;
            
            return {
                ...friend,
                friendshipId: friendship.id,
                friendsSince: friendship.acceptedAt,
                status: friendship.status
            };
        });

        res.json({
            success: true,
            data: friends
        });

    } catch (error) {
        console.error("Error getting friends:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get friends",
            message: error.message
        });
    }
});

/**
 * @route   GET /api/find-friends/requests
 * @desc    Get pending friend requests (received)
 * @access  Public (no auth)
 */
router.get("/requests", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        const pendingRequests = await prisma.friendship.findMany({
            where: {
                receiverId: userId,
                status: 'pending'
            },
            include: {
                requester: {
                    select: {
                        uid: true,
                        displayName: true,
                        photoURL: true,
                        university: true,
                        yearOfStudy: true,
                        faculty: true,
                        modules: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const requests = pendingRequests.map(request => ({
            requestId: request.id,
            uid: request.requester.uid, 
            displayName: request.requester.displayName,
            photoURL: request.requester.photoURL,
            faculty: request.requester.faculty,
            university: request.requester.university,
            yearOfStudy: request.requester.yearOfStudy,
            modules: request.requester.modules,
            user: request.requester, 
            requestedAt: request.createdAt,
            message: request.message
        }));

        res.json({
            success: true,
            data: requests
        });

    } catch (error) {
        console.error("Error getting friend requests:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get friend requests",
            message: error.message
        });
    }
});

/**
 * @route   POST /api/find-friends/request
 * @desc    Send a friend request
 * @access  Public (no auth)
 */
router.post("/request", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.requesterId || req.query.userId;
        const { receiverId, message } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing requesterId/userId"
            });
        }

        if (!receiverId) {
            return res.status(400).json({
                success: false,
                error: "Receiver ID is required"
            });
        }

        if (receiverId === userId) {
            return res.status(400).json({
                success: false,
                error: "Cannot send friend request to yourself"
            });
        }

        // Check if receiver exists
        const receiver = await prisma.user.findUnique({
            where: { uid: receiverId },
            select: { uid: true, displayName: true, fcmToken: true }
        });

        if (!receiver) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Check if friendship already exists
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId, receiverId },
                    { requesterId: receiverId, receiverId: userId }
                ]
            }
        });

        if (existingFriendship) {
            return res.status(400).json({
                success: false,
                error: existingFriendship.status === 'accepted' 
                    ? "Already friends" 
                    : "Friend request already exists"
            });
        }

        // Get current user info
        const currentUser = await prisma.user.findUnique({
            where: { uid: userId },
            select: { displayName: true }
        });

        // Create friendship request
        const friendship = await prisma.friendship.create({
            data: {
                requesterId: userId,
                receiverId,
                message,
                status: 'pending'
            }
        });

        // Create notification for receiver
        await prisma.notification.create({
            data: {
                userId: receiverId,
                senderId: userId,
                senderName: currentUser.displayName,
                title: "New Friend Request",
                body: `${currentUser.displayName} sent you a friend request`,
                type: "friend_request",
                data: {
                    friendshipId: friendship.id,
                    requesterId: userId,
                    message
                }
            }
        });

        res.status(201).json({
            success: true,
            message: "Friend request sent successfully",
            data: { friendshipId: friendship.id }
        });

    } catch (error) {
        console.error("Error sending friend request:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send friend request",
            message: error.message
        });
    }
});

/**
 * @route   POST /api/find-friends/request/:friendshipId/accept
 * @desc    Accept a friend request
 * @access  Public (no auth)
 */

router.post("/request/:friendshipId/accept", async (req, res) => {
    try {
      const userId = req.user?.uid || req.body.userId || req.query.userId;
      const { friendshipId } = req.params;
      const { friendId } = req.body; 
  
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "Missing userId"
        });
      }
  
      // Find the friendship request
      const friendship = await prisma.friendship.findFirst({
        where: {
          id: friendshipId,
          receiverId: userId, 
          status: 'pending'
        },
        include: {
          requester: {
            select: {
              uid: true,
              displayName: true,
              fcmToken: true
            }
          },
          receiver: {
            select: {
              uid: true,
              displayName: true,
              fcmToken: true
            }
          }
        }
      });
  
      if (!friendship) {
        return res.status(404).json({
          success: false,
          error: "Friend request not found or you don't have permission to accept it"
        });
      }
  
     
      if (friendId && friendId !== friendship.requesterId) {
        return res.status(400).json({
          success: false,
          error: "Friend ID does not match the request"
        });
      }
  
      // Get current user info
      const currentUser = await prisma.user.findUnique({
        where: { uid: userId },
        select: { displayName: true }
      });
  
      // Update friendship status
      const updatedFriendship = await prisma.friendship.update({
        where: { id: friendshipId },
        data: {
          status: 'accepted',
          acceptedAt: new Date(),
          respondedAt: new Date()
        }
      });
  
      // Create notification for requester
      await prisma.notification.create({
        data: {
          userId: friendship.requesterId,
          senderId: userId,
          senderName: currentUser.displayName,
          title: "Friend Request Accepted",
          body: `${currentUser.displayName} accepted your friend request`,
          type: "friend_request_response",
          data: {
            friendshipId: friendship.id,
            action: 'accept',
            responderId: userId
          }
        }
      });
  
      res.json({
        success: true,
        message: "Friend request accepted successfully",
        data: {
          friendshipId: updatedFriendship.id,
          status: updatedFriendship.status
        }
      });
  
    } catch (error) {
      console.error("Error accepting friend request:", error);
      res.status(500).json({
        success: false,
        error: "Failed to accept friend request",
        message: error.message
      });
    }
  });

/**
 * @route   POST /api/find-friends/request/:friendshipId/reject
 * @desc    Reject a friend request
 * @access  Public (no auth)
 */
router.post("/request/:friendshipId/reject", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId || req.query.userId;
        const { friendshipId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        // Find the friendship request
        const friendship = await prisma.friendship.findFirst({
            where: {
                id: friendshipId,
                receiverId: userId,
                status: 'pending'
            },
            include: {
                requester: {
                    select: {
                        uid: true,
                        displayName: true,
                        fcmToken: true
                    }
                }
            }
        });

        if (!friendship) {
            return res.status(404).json({
                success: false,
                error: "Friend request not found"
            });
        }

        // Get current user info
        const currentUser = await prisma.user.findUnique({
            where: { uid: userId },
            select: { displayName: true }
        });

        // Update friendship status
        const updatedFriendship = await prisma.friendship.update({
            where: { id: friendshipId },
            data: {
                status: 'declined',
                respondedAt: new Date()
            }
        });

        // Create notification for requester
        await prisma.notification.create({
            data: {
                userId: friendship.requesterId,
                senderId: userId,
                senderName: currentUser.displayName,
                title: "Friend Request Declined",
                body: `${currentUser.displayName} declined your friend request`,
                type: "friend_request_response",
                data: {
                    friendshipId: friendship.id,
                    action: 'decline',
                    responderId: userId
                }
            }
        });

        res.json({
            success: true,
            message: "Friend request rejected successfully",
            data: updatedFriendship
        });

    } catch (error) {
        console.error("Error rejecting friend request:", error);
        res.status(500).json({
            success: false,
            error: "Failed to reject friend request",
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/find-friends/request/:friendshipId/respond
 * @desc    Respond to a friend request (accept/decline)
 * @access  Public (no auth)
 */
router.put("/request/:friendshipId/respond", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId || req.query.userId;
        const { friendshipId } = req.params;
        const { action } = req.body; // 'accept' or 'decline'

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        if (!['accept', 'decline'].includes(action)) {
            return res.status(400).json({
                success: false,
                error: "Action must be 'accept' or 'decline'"
            });
        }

        // Find the friendship request
        const friendship = await prisma.friendship.findFirst({
            where: {
                id: friendshipId,
                receiverId: userId,
                status: 'pending'
            },
            include: {
                requester: {
                    select: {
                        uid: true,
                        displayName: true,
                        fcmToken: true
                    }
                }
            }
        });

        if (!friendship) {
            return res.status(404).json({
                success: false,
                error: "Friend request not found"
            });
        }

        // Get current user info
        const currentUser = await prisma.user.findUnique({
            where: { uid: userId },
            select: { displayName: true }
        });

        const newStatus = action === 'accept' ? 'accepted' : 'declined';
        const acceptedAt = action === 'accept' ? new Date() : null;

        // Update friendship status
        const updatedFriendship = await prisma.friendship.update({
            where: { id: friendshipId },
            data: {
                status: newStatus,
                acceptedAt,
                respondedAt: new Date()
            }
        });

        // Create notification for requester
        const notificationData = {
            userId: friendship.requesterId,
            senderId: userId,
            senderName: currentUser.displayName,
            title: action === 'accept' ? "Friend Request Accepted" : "Friend Request Declined",
            body: action === 'accept' 
                ? `${currentUser.displayName} accepted your friend request`
                : `${currentUser.displayName} declined your friend request`,
            type: "friend_request_response",
            data: {
                friendshipId: friendship.id,
                action,
                responderId: userId
            }
        };

        await prisma.notification.create({ data: notificationData });

        res.json({
            success: true,
            message: `Friend request ${action}ed successfully`,
            data: updatedFriendship
        });

    } catch (error) {
        console.error("Error responding to friend request:", error);
        res.status(500).json({
            success: false,
            error: "Failed to respond to friend request",
            message: error.message
        });
    }
});

/**
 * @route   DELETE /api/find-friends/:friendshipId
 * @desc    Remove a friend
 * @access  Public (no auth)
 */
router.delete("/:friendshipId/remove", async (req, res) => {
    try {
        const { userId, partnerId } = req.body;
        const { friendshipId } = req.params;

        if (!userId || !partnerId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId or partnerId"
            });
        }

        // Find and verify the friendship
        const friendship = await prisma.friendship.findFirst({
            where: {
                id: friendshipId,
                OR: [
                    { requesterId: userId, receiverId: partnerId },
                    { requesterId: partnerId, receiverId: userId }
                ]
            }
        });

        if (!friendship) {
            return res.status(404).json({
                success: false,
                error: "Friendship not found or you don't have permission to remove it"
            });
        }

        // Delete the friendship
        await prisma.friendship.delete({
            where: { id: friendshipId }
        });

        res.json({
            success: true,
            message: "Partner removed successfully"
        });

    } catch (error) {
        console.error("Error removing partner:", error);
        res.status(500).json({
            success: false,
            error: "Failed to remove partner",
            message: error.message
        });
    }
});

/**
 * @route   GET /api/find-friends/notifications
 * @desc    Get friend-related notifications
 * @access  Public (no auth)
 */
router.get("/notifications", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;
        const { page = 1, limit = 20 } = req.query;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId,
                type: {
                    in: ['friend_request', 'friend_request_response']
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit)
        });

        const total = await prisma.notification.count({
            where: {
                userId: userId,
                type: {
                    in: ['friend_request', 'friend_request_response']
                }
            }
        });

        res.json({
            success: true,
            data: {
                results: notifications,
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error getting notifications:", error);
        res.status(500).json({
            success: false,
            error: "Failed to get notifications",
            message: error.message
        });
    }
});

/**
 * @route   PUT /api/find-friends/notifications/:notificationId/read
 * @desc    Mark notification as read
 * @access  Public (no auth)
 */
router.put("/notifications/:notificationId/read", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId || req.query.userId;
        const { notificationId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        const notification = await prisma.notification.update({
            where: {
                id: notificationId,
                userId: userId
            },
            data: {
                read: true,
                readAt: new Date()
            }
        });

        res.json({
            success: true,
            data: notification
        });

    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({
            success: false,
            error: "Failed to mark notification as read",
            message: error.message
        });
    }
});

export default router;