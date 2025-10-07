

import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();


router.post("/", async (req, res) => {
    try {
        const {
            name,
            description,
            module,
            topic,
            createdBy,
            createdByName,
            maxMembers = 10,
            isPublic = true,
            tags = [],
            location,
            schedule,
            email,
         
            
        } = req.body;

        // Validation
        if (!name || !module || !createdBy) {
            return res.status(400).json({
                success: false,
                error: "Name, module, and createdBy are required"
            });
        }

       
        const userExists = await prisma.user.findUnique({
            where: { uid: createdBy },
            select: { uid: true, displayName: true }
        });

        if (!userExists) {

            //all this data will be dynamic.
            
            try {
                const newUser = await prisma.user.create({
                    data: {
                        uid: createdBy,
                        email: email, 
                        displayName: createdByName || "New User",
                        university: "Wits", 
                        studentId: "2546382",
                        yearOfStudy: 1,
                        faculty: "Science",
                        modules: [module]
                    }
                });
                // console.log("Created temporary user:", newUser);
            } catch (userCreationError) {
                if (userCreationError.code !== "P2002") { 
                    return res.status(400).json({
                        success: false,
                        error: "Failed to create user record",
                        message: process.env.NODE_ENV === "development" ? userCreationError.message : "User creation failed"
                    });
                }
            }
        }

        
        const finalCreatedByName = createdByName || userExists?.displayName || "Unknown User";

        // Create study group
        const studyGroup = await prisma.$transaction(async (tx) => {
            
            const newGroup = await tx.studyGroup.create({
                data: {
                    name: name.trim(),
                    description: description?.trim() || "",
                    module: module.trim(),
                    topic: topic?.trim() || "",
                    createdBy,
                    createdByName: finalCreatedByName,
                    maxMembers,
                    isPublic,
                    tags,
                    location: location || null,
                    schedule: schedule || null,
                    status: "active",
                    // uid
                }
            });

            //this is the first memeber by default.. more features to come
            await tx.groupMember.create({
                data: {
                    userId: createdBy,
                    groupId: newGroup.id
                }
            });

            return newGroup;
        });

        res.status(201).json({
            success: true,
            data: studyGroup,
            message: "Study group created successfully"
        });

    } catch (error) {
        console.error("Error creating study group:", error);
        
        // Handle specific Prisma errors
        if (error.code === "P2003") {
            return res.status(400).json({
                success: false,
                error: "Invalid user reference. Please ensure user account exists."
            });
        }

        if (error.code === "P2002") {
            return res.status(409).json({
                success: false,
                error: "A study group with similar details already exists"
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to create study group",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.get("/", async (req, res) => {
    try {
        const { 
            module, 
            search, 
            isPublic, 
            limit = 20, 
            offset = 0,
            sortBy = "lastActivityAt",
            sortOrder = "desc",
            userId 
        } = req.query;

        const whereClause = {
            status: "active" 
        };

        if (module) {
            whereClause.module = {
                contains: module,
                mode: "insensitive"
            };
        }

        if (search) {
            whereClause.OR = [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    description: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    topic: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ];
        }

        if (isPublic !== undefined) {
            whereClause.isPublic = isPublic === "true";
        }

        const studyGroups = await prisma.studyGroup.findMany({
            where: whereClause,
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        photoURL: true
                    }
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                uid: true,
                                displayName: true,
                                photoURL: true
                            }
                        }
                    }
                },
                joinRequests: {
                    where: {
                        status: "pending"
                    },
                    include: {
                        user: {
                            select: {
                                uid: true,
                                displayName: true,
                                photoURL: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                [sortBy]: sortOrder
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        
        const transformedGroups = studyGroups.map(group => {
            let userStatus = "not_member"; // Default status
            let hasPendingRequest = false;

            if (userId) {
                
                const isMember = group.members.some(member => member.user.uid === userId);
                if (isMember) {
                    userStatus = "member";
                }

                // Check if user is the creator
                if (group.createdBy === userId) {
                    userStatus = "creator";
                }

                
                hasPendingRequest = group.joinRequests.some(request => request.user.uid === userId);
                if (hasPendingRequest && userStatus === "not_member") {
                    userStatus = "pending";
                }
            }

            return {
                id: group.id,
                name: group.name,
                description: group.description,
                module: group.module,
                topic: group.topic,
                createdBy: group.createdBy,
                createdByName: group.createdByName,
                memberCount: group.members.length,
                maxMembers: group.maxMembers,
                isPublic: group.isPublic,
                tags: group.tags,
                location: group.location,
                schedule: group.schedule,
                status: group.status,
                createdAt: group.createdAt,
                updatedAt: group.updatedAt,
                lastActivityAt: group.lastActivityAt,
                creator: group.creator,
                userStatus: userStatus, 
                pendingRequestsCount: group.joinRequests.length,
                members: group.members.map(member => ({
                    id: member.user.id,
                    uid: member.user.uid,
                    displayName: member.user.displayName,
                    photoURL: member.user.photoURL
                }))
            };
        });

        const totalCount = await prisma.studyGroup.count({
            where: whereClause
        });

        res.json({
            success: true,
            data: {
                studyGroups: transformedGroups,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: parseInt(offset) + parseInt(limit) < totalCount
                }
            }
        });

    } catch (error) {
        console.error("Error fetching study groups:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch study groups",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.post("/:id/request-join", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, message } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        // Check if study group exists and is active
        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id },
            include: {
                members: true,
                joinRequests: {
                    where: {
                        userId: userId,
                        status: "pending"
                    }
                }
            }
        });

        if (!studyGroup) {
            return res.status(404).json({
                success: false,
                error: "Study group not found"
            });
        }

        if (studyGroup.status !== "active") {
            return res.status(400).json({
                success: false,
                error: "Study group is not active"
            });
        }

        // Check if group is full
        if (studyGroup.members.length >= studyGroup.maxMembers) {
            return res.status(400).json({
                success: false,
                error: "Study group is full"
            });
        }

        // Check if user is already a member
        const existingMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId,
                    groupId: id
                }
            }
        });

        if (existingMember) {
            return res.status(400).json({
                success: false,
                error: "You are already a member of this group"
            });
        }

        // Check if user has pending request
        if (studyGroup.joinRequests.length > 0) {
            return res.status(400).json({
                success: false,
                error: "You already have a pending request for this group"
            });
        }

        // Create join request
        await prisma.groupJoinRequest.create({
            data: {
                userId,
                groupId: id,
                message: message || null
            }
        });

        // Create notification for group creator
        const userInfo = await prisma.user.findUnique({
            where: { uid: userId },
            select: { displayName: true }
        });

        await prisma.notification.create({
            data: {
                userId: studyGroup.createdBy,
                senderId: userId,
                senderName: userInfo?.displayName || "Unknown User",
                title: "New Join Request",
                body: `${userInfo?.displayName || "Someone"} wants to join "${studyGroup.name}"`,
                type: "join_request",
                data: {
                    groupId: id,
                    groupName: studyGroup.name,
                    requesterId: userId
                }
            }
        });

        res.json({
            success: true,
            message: "Join request sent successfully"
        });

    } catch (error) {
        console.error("Error requesting to join study group:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send join request",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.post("/:id/respond-request", async (req, res) => {
    try {
        const { id } = req.params;
        const { requestId, action, adminId } = req.body; // action: 'approve' or 'reject'

        if (!requestId || !action || !adminId) {
            return res.status(400).json({
                success: false,
                error: "Request ID, action, and admin ID are required"
            });
        }

        // Verify admin is group creator
        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id }
        });

        if (!studyGroup || studyGroup.createdBy !== adminId) {
            return res.status(403).json({
                success: false,
                error: "Only the group creator can respond to requests"
            });
        }

        // Get the join request
        const joinRequest = await prisma.groupJoinRequest.findUnique({
            where: { id: requestId },
            include: {
                user: {
                    select: { uid: true, displayName: true }
                }
            }
        });

        if (!joinRequest) {
            return res.status(404).json({
                success: false,
                error: "Join request not found"
            });
        }

        if (action === 'approve') {
            // Add user to group and update request
            await prisma.$transaction(async (tx) => {
                // Create group membership
                await tx.groupMember.create({
                    data: {
                        userId: joinRequest.userId,
                        groupId: id
                    }
                });

                // Update join request
                await tx.groupJoinRequest.update({
                    where: { id: requestId },
                    data: {
                        status: "approved",
                        respondedAt: new Date(),
                        respondedBy: adminId
                    }
                });

                // Update group activity
                await tx.studyGroup.update({
                    where: { id },
                    data: {
                        lastActivityAt: new Date()
                    }
                });
            });

            // Notify the user
            await prisma.notification.create({
                data: {
                    userId: joinRequest.userId,
                    senderId: adminId,
                    senderName: "Study Group",
                    title: "Join Request Approved",
                    body: `You've been accepted into "${studyGroup.name}"`,
                    type: "request_approved",
                    data: {
                        groupId: id,
                        groupName: studyGroup.name
                    }
                }
            });

        } else if (action === 'reject') {
            // Update request status
            await prisma.groupJoinRequest.update({
                where: { id: requestId },
                data: {
                    status: "rejected",
                    respondedAt: new Date(),
                    respondedBy: adminId
                }
            });

            // Notify the user
            await prisma.notification.create({
                data: {
                    userId: joinRequest.userId,
                    senderId: adminId,
                    senderName: "Study Group",
                    title: "Join Request Declined",
                    body: `Your request to join "${studyGroup.name}" was declined`,
                    type: "request_rejected",
                    data: {
                        groupId: id,
                        groupName: studyGroup.name
                    }
                }
            });
        }

        res.json({
            success: true,
            message: `Request ${action}d successfully`
        });

    } catch (error) {
        console.error("Error responding to join request:", error);
        res.status(500).json({
            success: false,
            error: "Failed to respond to request",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.get("/:id/join-requests", async (req, res) => {
    try {
        const { id } = req.params;
        const { adminId } = req.query;

        // Verify admin
        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id }
        });

        if (!studyGroup || studyGroup.createdBy !== adminId) {
            return res.status(403).json({
                success: false,
                error: "Only the group creator can view join requests"
            });
        }

        const joinRequests = await prisma.groupJoinRequest.findMany({
            where: {
                groupId: id,
                status: "pending"
            },
            include: {
                user: {
                    select: {
                        uid: true,
                        displayName: true,
                        photoURL: true,
                        university: true,
                        faculty: true,
                        yearOfStudy: true
                    }
                }
            },
            orderBy: {
                requestedAt: "desc"
            }
        });

        res.json({
            success: true,
            data: joinRequests
        });

    } catch (error) {
        console.error("Error fetching join requests:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch join requests",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.get("/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, limit = 50, offset = 0 } = req.query;

        // Verify user is member
        const isMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: id
                }
            }
        });

        if (!isMember) {
            return res.status(403).json({
                success: false,
                error: "You must be a member to view messages"
            });
        }

        const messages = await prisma.groupMessage.findMany({
            where: { groupId: id },
            include: {
                sender: {
                    select: {
                        uid: true,
                        displayName: true,
                        photoURL: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        res.json({
            success: true,
            data: messages.reverse()
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch messages",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});




// router.post("/:id/messages", async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { userId, message, messageType = "text", attachments = [] } = req.body;

//         // Verify user is member
//         const member = await prisma.groupMember.findUnique({
//             where: {
//                 userId_groupId: {
//                     userId: userId,
//                     groupId: id
//                 }
//             },
//             include: {
//                 user: {
//                     select: {
//                         displayName: true
//                     }
//                 }
//             }
//         });

//         if (!member) {
//             return res.status(403).json({
//                 success: false,
//                 error: "You must be a member to send messages"
//             });
//         }

//         const newMessage = await prisma.groupMessage.create({
//             data: {
//                 groupId: id,
//                 senderId: userId,
//                 senderName: member.user.displayName,
//                 message: message,
//                 messageType: messageType,
//                 attachments: attachments
//             },
//             include: {
//                 sender: {
//                     select: {
//                         uid: true,
//                         displayName: true,
//                         photoURL: true
//                     }
//                 }
//             }
//         });

//         // Update group last activity
//         await prisma.studyGroup.update({
//             where: { id },
//             data: {
//                 lastActivityAt: new Date()
//             }
//         });

//         res.json({
//             success: true,
//             data: newMessage
//         });

//     } catch (error) {
//         console.error("Error sending message:", error);
//         res.status(500).json({
//             success: false,
//             error: "Failed to send message",
//             message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
//         });
//     }
// });


router.post("/:id/messages", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, message, messageType = "text", attachments = [] } = req.body;

        // Verify user is member
        const member = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: id
                }
            },
            include: {
                user: {
                    select: {
                        displayName: true
                    }
                }
            }
        });

        if (!member) {
            return res.status(403).json({
                success: false,
                error: "You must be a member to send messages"
            });
        }

        // Process attachments to ensure they're in the correct format
        const processedAttachments = attachments.map(attachment => {
            if (typeof attachment === 'string') {
                
                return attachment;
            } else {
                // New format - object with url, filename, etc.
                return {
                    url: attachment.url,
                    filename: attachment.filename,
                    size: attachment.size,
                    type: attachment.type,
                    storagePath: attachment.storagePath
                };
            }
        });

        const newMessage = await prisma.groupMessage.create({
            data: {
                groupId: id,
                senderId: userId,
                senderName: member.user.displayName,
                message: message || '',
                messageType: messageType,
                attachments: processedAttachments
            },
            include: {
                sender: {
                    select: {
                        uid: true,
                        displayName: true,
                        photoURL: true
                    }
                }
            }
        });

       
        await prisma.studyGroup.update({
            where: { id },
            data: {
                lastActivityAt: new Date()
            }
        });

        res.json({
            success: true,
            data: newMessage
        });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            error: "Failed to send message",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.delete("/:id/messages/:messageId/file", async (req, res) => {
    try {
        const { id, messageId } = req.params;
        const { userId, storagePath } = req.body;

        
        const message = await prisma.groupMessage.findUnique({
            where: { id: messageId }
        });

        if (!message || message.groupId !== id) {
            return res.status(404).json({
                success: false,
                error: "Message not found"
            });
        }

        // Check if user is the sender or group admin
        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id }
        });

        const isAuthorized = message.senderId === userId || studyGroup.createdBy === userId;

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                error: "You don't have permission to delete this file"
            });
        }

        

        const updatedAttachments = message.attachments.filter(
            att => att.storagePath !== storagePath
        );

        await prisma.groupMessage.update({
            where: { id: messageId },
            data: {
                attachments: updatedAttachments,
                messageType: updatedAttachments.length > 0 ? "file" : "text"
            }
        });

        res.json({
            success: true,
            message: "File reference removed successfully"
        });

    } catch (error) {
        console.error("Error deleting file:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete file",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});

router.get("/:id/is-member", async (req, res) => {
    try {
        const { id } = req.params;

        // Check if study group exists
        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                photoURL: true,
                                university: true,
                                faculty: true,
                                yearOfStudy: true
                            }
                        }
                    }
                }
            }
        });

        if (!studyGroup) {
            return res.status(404).json({
                success: false,
                error: "Study group not found"
            });
        }

        const members = studyGroup.members.map(member => ({
            id: member.user.id,
            displayName: member.user.displayName,
            photoURL: member.user.photoURL,
            university: member.user.university,
            faculty: member.user.faculty,
            yearOfStudy: member.user.yearOfStudy
        }));

        res.json({
            success: true,
            data: members
        });

    } catch (error) {
        console.error("Error fetching group members:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch group members",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
})


router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; 

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "User ID is required"
            });
        }

        // Check if study group exists and user is the creator
        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id }
        });

        if (!studyGroup) {
            return res.status(404).json({
                success: false,
                error: "Study group not found"
            });
        }

        if (studyGroup.createdBy !== userId) {
            return res.status(403).json({
                success: false,
                error: "Only the creator can delete this study group"
            });
        }

        // Delete study group 
        await prisma.StudyGroup.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: "Study group deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting study group:", error);
        res.status(500).json({
            success: false,
            error: "Failed to delete study group",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});




router.post("/:id/sessions", async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            userId, 
            module, 
            topic, 
            sessionType = "group",
            location,
            activities,
            notes 
        } = req.body;

       
        const member = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: id
                }
            },
            include: {
                user: {
                    select: {
                        displayName: true
                    }
                }
            }
        });

        if (!member) {
            return res.status(403).json({
                success: false,
                error: "You must be a member to start sessions"
            });
        }

        // Get group details
        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                displayName: true
                            }
                        }
                    }
                }
            }
        });

        if (!studyGroup) {
            return res.status(404).json({
                success: false,
                error: "Study group not found"
            });
        }

        // Check if there's already an active session
        const activeSession = await prisma.studySession.findFirst({
            where: {
                groupId: id,
                completed: false
            }
        });

        if (activeSession) {
            return res.status(400).json({
                success: false,
                error: "There's already an active session in this group"
            });
        }

        const startTime = new Date();

        // Create study session
        const session = await prisma.$transaction(async (tx) => {
            // Create the session
            const newSession = await tx.studySession.create({
                data: {
                    userId,
                    groupId: id,
                    module,
                    topic,
                    sessionType,
                    duration: 0, // Will be calculated on completion
                    startTime,
                    endTime: startTime, // Placeholder, will be updated on completion
                    location: location || null,
                    activities: activities || null,
                    notes: notes || null
                }
            });

            // Add all group members as participants
            const participants = studyGroup.members.map(member => ({
                sessionId: newSession.id,
                userId: member.userId
            }));

            await tx.studySessionParticipant.createMany({
                data: participants
            });

            // Create session start message
            await tx.groupMessage.create({
                data: {
                    groupId: id,
                    senderId: userId,
                    senderName: member.user.displayName,
                    message: `📚 Study session started: ${module} - ${topic}`,
                    messageType: "system"
                }
            });

            return newSession;
        });

        // Create notifications for all members except the creator
        const notifications = studyGroup.members
            .filter(member => member.userId !== userId)
            .map(member => ({
                userId: member.userId,
                senderId: userId,
                senderName: member.user.displayName,
                title: "Study Session Started",
                body: `${member.user.displayName} started a study session in "${studyGroup.name}"`,
                type: "session_started",
                data: {
                    groupId: id,
                    sessionId: session.id,
                    groupName: studyGroup.name,
                    module,
                    topic
                }
            }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications
            });
        }

        res.json({
            success: true,
            data: session,
            message: "Study session started successfully"
        });

    } catch (error) {
        console.error("Error starting study session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to start study session",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.put("/:id/sessions/:sessionId/end", async (req, res) => {
    try {
        const { id, sessionId } = req.params;
        const { userId, rating, notes, completionPercentage = 100 } = req.body;

        // Verify session exists and user is authorized
        const session = await prisma.studySession.findUnique({
            where: { id: sessionId },
            include: {
                user: {
                    select: {
                        displayName: true
                    }
                }
            }
        });

        if (!session || session.groupId !== id) {
            return res.status(404).json({
                success: false,
                error: "Session not found"
            });
        }

        if (session.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: "Only the session creator can end the session"
            });
        }

        if (session.completed) {
            return res.status(400).json({
                success: false,
                error: "Session is already completed"
            });
        }

        const endTime = new Date();
        const duration = Math.floor((endTime - session.startTime) / 1000 / 60); // Duration in minutes

        // Update session and create progress tracking
        const updatedSession = await prisma.$transaction(async (tx) => {
            // Update the session
            const updated = await tx.studySession.update({
                where: { id: sessionId },
                data: {
                    endTime,
                    duration,
                    completed: true,
                    rating,
                    notes: notes || session.notes
                }
            });

            // Get all participants
            const participants = await tx.studySessionParticipant.findMany({
                where: { sessionId },
                include: {
                    user: {
                        select: {
                            uid: true,
                            displayName: true
                        }
                    }
                }
            });

            // Update progress tracking for all participants
            const studyHours = duration / 60; // Convert to hours

            for (const participant of participants) {
                await tx.progressTracking.upsert({
                    where: {
                        userId_module_topic: {
                            userId: participant.userId,
                            module: session.module,
                            topic: session.topic
                        }
                    },
                    update: {
                        studyHours: {
                            increment: studyHours
                        },
                        lastStudied: endTime,
                        completionPercentage: Math.max(completionPercentage, 0),
                        status: completionPercentage >= 100 ? "completed" : "in_progress",
                        updatedAt: endTime
                    },
                    create: {
                        userId: participant.userId,
                        module: session.module,
                        topic: session.topic,
                        status: completionPercentage >= 100 ? "completed" : "in_progress",
                        completionPercentage,
                        studyHours,
                        lastStudied: endTime
                    }
                });
            }

            // Create session end message
            await tx.groupMessage.create({
                data: {
                    groupId: id,
                    senderId: userId,
                    senderName: session.user.displayName,
                    message: `✅ Study session completed: ${session.module} - ${session.topic} (${duration} minutes)`,
                    messageType: "system"
                }
            });

            return updated;
        });

        res.json({
            success: true,
            data: updatedSession,
            message: "Study session ended successfully"
        });

    } catch (error) {
        console.error("Error ending study session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to end study session",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.post("/:id/sessions/:sessionId/join", async (req, res) => {
    try {
        const { id, sessionId } = req.params;
        const { userId } = req.body;

        // Verify user is member
        const member = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: id
                }
            },
            include: {
                user: {
                    select: {
                        displayName: true
                    }
                }
            }
        });

        if (!member) {
            return res.status(403).json({
                success: false,
                error: "You must be a member to join sessions"
            });
        }

        // Check if session exists and is active
        const session = await prisma.studySession.findUnique({
            where: { id: sessionId }
        });

        if (!session || session.groupId !== id || session.completed) {
            return res.status(400).json({
                success: false,
                error: "Session not found or already completed"
            });
        }

        // Check if already a participant
        const existingParticipant = await prisma.studySessionParticipant.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId
                }
            }
        });

        if (existingParticipant) {
            return res.status(400).json({
                success: false,
                error: "You are already participating in this session"
            });
        }

        // Add as participant
        await prisma.studySessionParticipant.create({
            data: {
                sessionId,
                userId
            }
        });

        // Create join message
        await prisma.groupMessage.create({
            data: {
                groupId: id,
                senderId: userId,
                senderName: member.user.displayName,
                message: `👋 ${member.user.displayName} joined the study session`,
                messageType: "system"
            }
        });

        res.json({
            success: true,
            message: "Successfully joined the study session"
        });

    } catch (error) {
        console.error("Error joining study session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to join study session",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.get("/:id/sessions/active", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        // Verify user is member
        const isMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: id
                }
            }
        });

        if (!isMember) {
            return res.status(403).json({
                success: false,
                error: "You must be a member to view sessions"
            });
        }

        const activeSession = await prisma.studySession.findFirst({
            where: {
                groupId: id,
                completed: false
            },
            include: {
                user: {
                    select: {
                        uid: true,
                        displayName: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                displayName: true,
                                photoURL: true
                            }
                        }
                    }
                }
            }
        });

        res.json({
            success: true,
            data: activeSession
        });

    } catch (error) {
        console.error("Error fetching active session:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch active session",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.get("/:id/sessions/history", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, limit = 20, offset = 0 } = req.query;

        // Verify user is member
        const isMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: id
                }
            }
        });

        if (!isMember) {
            return res.status(403).json({
                success: false,
                error: "You must be a member to view session history"
            });
        }

        const sessions = await prisma.studySession.findMany({
            where: {
                groupId: id,
                completed: true
            },
            include: {
                user: {
                    select: {
                        uid: true,
                        displayName: true
                    }
                },
                participants: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                displayName: true,
                                photoURL: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                startTime: "desc"
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });

        const totalCount = await prisma.studySession.count({
            where: {
                groupId: id,
                completed: true
            }
        });

        res.json({
            success: true,
            data: {
                sessions,
                pagination: {
                    total: totalCount,
                    limit: parseInt(limit),
                    offset: parseInt(offset),
                    hasMore: parseInt(offset) + parseInt(limit) < totalCount
                }
            }
        });

    } catch (error) {
        console.error("Error fetching session history:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch session history",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});


router.get("/:id/progress", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        // Verify user is member
        const isMember = await prisma.groupMember.findUnique({
            where: {
                userId_groupId: {
                    userId: userId,
                    groupId: id
                }
            }
        });

        if (!isMember) {
            return res.status(403).json({
                success: false,
                error: "You must be a member to view progress"
            });
        }

        // Get group members
        const group = await prisma.studyGroup.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                uid: true,
                                displayName: true,
                                photoURL: true
                            }
                        }
                    }
                }
            }
        });

        const memberIds = group.members.map(m => m.userId);

        // Get progress for all members
        const progress = await prisma.progressTracking.findMany({
            where: {
                userId: {
                    in: memberIds
                }
            },
            include: {
                user: {
                    select: {
                        uid: true,
                        displayName: true,
                        photoURL: true
                    }
                }
            },
            orderBy: {
                studyHours: "desc"
            }
        });

        // Get session stats
        const sessionStats = await prisma.studySession.aggregate({
            where: {
                groupId: id,
                completed: true
            },
            _sum: {
                duration: true
            },
            _count: {
                id: true
            }
        });

        res.json({
            success: true,
            data: {
                progress,
                stats: {
                    totalSessions: sessionStats._count.id || 0,
                    totalMinutes: sessionStats._sum.duration || 0,
                    totalHours: Math.round((sessionStats._sum.duration || 0) / 60 * 100) / 100
                }
            }
        });

    } catch (error) {
        console.error("Error fetching group progress:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch progress data",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});

export default router;