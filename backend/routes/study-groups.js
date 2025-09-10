

import express from "express";
import { PrismaClient } from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();

// GET /api/study-groups - Fetch all study groups
router.get("/", async (req, res) => {
    try {
        const { 
            module, 
            search, 
            isPublic, 
            limit = 20, 
            offset = 0,
            sortBy = "lastActivityAt",
            sortOrder = "desc" 
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

        // Filter by search term (searches name, description, topic)
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

        // Filter by public/private
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

        // Transform the data to match your frontend expectations
        const transformedGroups = studyGroups.map(group => ({
            id: group.id,
            name: group.name,
            description: group.description,
            module: group.module,
            topic: group.topic,
            createdBy: group.createdBy,
            createdByName: group.createdByName,
            memberCount: group.members.length, // Use actual count from members array
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
            members: group.members.map(member => ({
                id: member.user.id,
                displayName: member.user.displayName,
                photoURL: member.user.photoURL
            }))
        }));

        // Get total count for pagination
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
            email
            
        } = req.body;

        // Validation
        if (!name || !module || !createdBy) {
            return res.status(400).json({
                success: false,
                error: "Name, module, and createdBy are required"
            });
        }

        // Validate that the creator exists in the users table
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
                console.log("Created temporary user:", newUser);
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
                    status: "active"
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


// GET /api/study-groups/:id - Fetch single study group
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const studyGroup = await prisma.studyGroup.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        photoURL: true,
                        university: true,
                        faculty: true
                    }
                },
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

        const transformedGroup = {
            id: studyGroup.id,
            name: studyGroup.name,
            description: studyGroup.description,
            module: studyGroup.module,
            topic: studyGroup.topic,
            createdBy: studyGroup.createdBy,
            createdByName: studyGroup.createdByName,
            memberCount: studyGroup.members.length, 
            maxMembers: studyGroup.maxMembers,
            isPublic: studyGroup.isPublic,
            tags: studyGroup.tags,
            location: studyGroup.location,
            schedule: studyGroup.schedule,
            status: studyGroup.status,
            createdAt: studyGroup.createdAt,
            updatedAt: studyGroup.updatedAt,
            lastActivityAt: studyGroup.lastActivityAt,
            creator: studyGroup.creator,
            members: studyGroup.members.map(member => ({
                id: member.user.id,
                displayName: member.user.displayName,
                photoURL: member.user.photoURL,
                university: member.user.university,
                faculty: member.user.faculty,
                yearOfStudy: member.user.yearOfStudy
            }))
        };

        res.json({
            success: true,
            data: transformedGroup
        });

    } catch (error) {
        console.error("Error fetching study group:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch study group",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});

// POST /api/study-groups/:id/join - Request to join a study group
router.post("/:id/join", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

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
                members: true
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

        // Add user to group
        await prisma.$transaction(async (tx) => {
            // Create group membership
            await tx.groupMember.create({
                data: {
                    userId,
                    groupId: id
                }
            });

            // Update last activity time
            await tx.studyGroup.update({
                where: { id },
                data: {
                    lastActivityAt: new Date()
                }
            });
        });

        res.json({
            success: true,
            message: "Successfully joined the study group"
        });

    } catch (error) {
        console.error("Error joining study group:", error);
        res.status(500).json({
            success: false,
            error: "Failed to join study group",
            message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
        });
    }
});

// DELETE /api/study-groups/:id - Delete a study group (creator only)
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

export default router;