import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/profile
 * @desc    Get user profile data
 * @access  Public (no auth) - uses userId from query params
 */
router.get("/", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        const user = await prisma.user.findUnique({
            where: { uid: userId },
            select: {
                id: true,
                uid: true,
                email: true,
                displayName: true,
                photoURL: true,
                university: true,
                studentId: true,
                yearOfStudy: true,
                faculty: true,
                modules: true,
                fcmToken: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                studyPreferences: true,
                availability: true,
               
                _count: {
                    select: {
                        createdGroups: true,
                        groupMemberships: true,
                        studySessions: true,
                        sentFriendRequests: true,
                        receivedFriendRequests: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

       
        const stats = {
            totalGroupsCreated: user._count.createdGroups,
            totalGroupMemberships: user._count.groupMemberships,
            totalStudySessions: user._count.studySessions,
            totalFriendRequestsSent: user._count.sentFriendRequests,
            totalFriendRequestsReceived: user._count.receivedFriendRequests
        };

        
        const { _count, ...profileData } = user;

        res.json({
            success: true,
            data: {
                ...profileData,
                stats
            }
        });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch user profile",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/profile
 * @desc    Update user profile data
 * @access  Public (no auth) - uses userId from request body
 */
router.put("/", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        
        const {
            displayName,
            photoURL,
            university,
            studentId,
            yearOfStudy,
            faculty,
            modules,
            studyPreferences,
            availability,
            fcmToken,
            
            userId: _,
            ...otherFields
        } = req.body;

        // Validate required fields
        if (!displayName || displayName.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Display name is required"
            });
        }

        if (!university || university.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "University is required"
            });
        }


        if (yearOfStudy && (yearOfStudy < 1 || yearOfStudy > 10)) {
            return res.status(400).json({
                success: false,
                error: "Year of study must be between 1 and 10"
            });
        }

       
        if (modules && !Array.isArray(modules)) {
            return res.status(400).json({
                success: false,
                error: "Modules must be an array"
            });
        }

        // Clean up modules array (remove empty strings)
        const cleanModules = modules ? modules.filter(m => m && m.trim().length > 0) : undefined;

        // Validate studyPreferences structure
        if (studyPreferences && typeof studyPreferences !== 'object') {
            return res.status(400).json({
                success: false,
                error: "Study preferences must be an object"
            });
        }

        
        if (availability && typeof availability !== 'object') {
            return res.status(400).json({
                success: false,
                error: "Availability must be an object"
            });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { uid: userId }
        });

        if (!existingUser) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Prepare update data - only include fields that are provided
        const updateData = {};

        if (displayName !== undefined) updateData.displayName = displayName.trim();
        if (photoURL !== undefined) updateData.photoURL = photoURL;
        if (university !== undefined) updateData.university = university.trim();
        if (studentId !== undefined) updateData.studentId = studentId;
        if (yearOfStudy !== undefined) updateData.yearOfStudy = yearOfStudy;
        if (faculty !== undefined) updateData.faculty = faculty;
        if (cleanModules !== undefined) updateData.modules = cleanModules;
        if (studyPreferences !== undefined) updateData.studyPreferences = studyPreferences;
        if (availability !== undefined) updateData.availability = availability;
        if (fcmToken !== undefined) updateData.fcmToken = fcmToken;

       
        updateData.updatedAt = new Date();

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { uid: userId },
            data: updateData,
            select: {
                id: true,
                uid: true,
                email: true,
                displayName: true,
                photoURL: true,
                university: true,
                studentId: true,
                yearOfStudy: true,
                faculty: true,
                modules: true,
                fcmToken: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                studyPreferences: true,
                availability: true,
                _count: {
                    select: {
                        createdGroups: true,
                        groupMemberships: true,
                        studySessions: true,
                        sentFriendRequests: true,
                        receivedFriendRequests: true
                    }
                }
            }
        });

        // Calculate additional profile stats
        const stats = {
            totalGroupsCreated: updatedUser._count.createdGroups,
            totalGroupMemberships: updatedUser._count.groupMemberships,
            totalStudySessions: updatedUser._count.studySessions,
            totalFriendRequestsSent: updatedUser._count.sentFriendRequests,
            totalFriendRequestsReceived: updatedUser._count.receivedFriendRequests
        };

        // Remove the _count field and add stats
        const { _count, ...profileData } = updatedUser;

        res.json({
            success: true,
            message: "Profile updated successfully",
            data: {
                ...profileData,
                stats
            }
        });

    } catch (error) {
        console.error("Error updating user profile:", error);
        
        // Handle specific Prisma errors
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                error: "A user with this email or student ID already exists"
            });
        }

        res.status(500).json({
            success: false,
            error: "Failed to update user profile",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   POST /api/profile/upload-photo
 * @desc    Upload profile photo
 * @access  Public (no auth)
 */
router.post("/upload-photo", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId;
        const { photoURL } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        if (!photoURL) {
            return res.status(400).json({
                success: false,
                error: "Photo URL is required"
            });
        }

       
        const updatedUser = await prisma.user.update({
            where: { uid: userId },
            data: { 
                photoURL,
                updatedAt: new Date()
            },
            select: {
                uid: true,
                displayName: true,
                photoURL: true
            }
        });

        res.json({
            success: true,
            message: "Profile photo updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Error uploading profile photo:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update profile photo",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/profile/study-preferences
 * @desc    Update only study preferences
 * @access  Public (no auth)
 */
router.put("/study-preferences", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId;
        const { studyPreferences } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        if (!studyPreferences || typeof studyPreferences !== 'object') {
            return res.status(400).json({
                success: false,
                error: "Valid study preferences object is required"
            });
        }

        // Validate study preferences structure
        const validStudyStyles = ['visual', 'auditory', 'kinesthetic', 'reading'];
        const validGroupSizes = ['individual', 'small', 'medium', 'large'];
        const validStudyTimes = ['early_morning', 'morning', 'afternoon', 'evening', 'night'];

        if (studyPreferences.studyStyle && !validStudyStyles.includes(studyPreferences.studyStyle)) {
            return res.status(400).json({
                success: false,
                error: "Invalid study style"
            });
        }

        if (studyPreferences.groupSize && !validGroupSizes.includes(studyPreferences.groupSize)) {
            return res.status(400).json({
                success: false,
                error: "Invalid group size preference"
            });
        }

        if (studyPreferences.preferredStudyTimes) {
            if (!Array.isArray(studyPreferences.preferredStudyTimes)) {
                return res.status(400).json({
                    success: false,
                    error: "Preferred study times must be an array"
                });
            }

            const invalidTimes = studyPreferences.preferredStudyTimes.filter(
                time => !validStudyTimes.includes(time)
            );

            if (invalidTimes.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid study times: ${invalidTimes.join(', ')}`
                });
            }
        }

        const updatedUser = await prisma.user.update({
            where: { uid: userId },
            data: { 
                studyPreferences,
                updatedAt: new Date()
            },
            select: {
                uid: true,
                displayName: true,
                studyPreferences: true,
                updatedAt: true
            }
        });

        res.json({
            success: true,
            message: "Study preferences updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Error updating study preferences:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update study preferences",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   PUT /api/profile/availability
 * @desc    Update availability schedule
 * @access  Public (no auth)
 */
router.put("/availability", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId;
        const { availability } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        if (!availability || typeof availability !== 'object') {
            return res.status(400).json({
                success: false,
                error: "Valid availability object is required"
            });
        }

        const updatedUser = await prisma.user.update({
            where: { uid: userId },
            data: { 
                availability,
                updatedAt: new Date()
            },
            select: {
                uid: true,
                displayName: true,
                availability: true,
                updatedAt: true
            }
        });

        res.json({
            success: true,
            message: "Availability updated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({
            success: false,
            error: "Failed to update availability",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/profile/stats
 * @desc    Get user profile statistics
 * @access  Public (no auth)
 */
router.get("/stats", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        // Get comprehensive user statistics
        const userStats = await prisma.user.findUnique({
            where: { uid: userId },
            select: {
                displayName: true,
                createdAt: true,
                _count: {
                    select: {
                        createdGroups: true,
                        groupMemberships: true,
                        studySessions: true,
                        progressRecords: true,
                        sentMessages: true,
                        notifications: true,
                        uploadedFiles: true,
                        sessionParticipants: true,
                        sentFriendRequests: {
                            where: { status: 'accepted' }
                        },
                        receivedFriendRequests: {
                            where: { status: 'accepted' }
                        }
                    }
                }
            }
        });

        if (!userStats) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Calculate additional stats
        const totalFriends = userStats._count.sentFriendRequests + userStats._count.receivedFriendRequests;
        const accountAge = Math.floor((new Date() - new Date(userStats.createdAt)) / (1000 * 60 * 60 * 24));

        const stats = {
            totalGroupsCreated: userStats._count.createdGroups,
            totalGroupMemberships: userStats._count.groupMemberships,
            totalStudySessions: userStats._count.studySessions,
            totalProgressRecords: userStats._count.progressRecords,
            totalMessagesSent: userStats._count.sentMessages,
            totalNotifications: userStats._count.notifications,
            totalFilesUploaded: userStats._count.uploadedFiles,
            totalSessionsParticipated: userStats._count.sessionParticipants,
            totalFriends,
            accountAgeInDays: accountAge
        };

        res.json({
            success: true,
            data: {
                user: {
                    displayName: userStats.displayName,
                    memberSince: userStats.createdAt
                },
                stats
            }
        });

    } catch (error) {
        console.error("Error fetching profile stats:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch profile statistics",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   DELETE /api/profile
 * @desc    Delete user profile (soft delete - set isActive to false)
 * @access  Public (no auth)
 */
router.delete("/", async (req, res) => {
    try {
        const userId = req.user?.uid || req.body.userId || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

       
        const updatedUser = await prisma.user.update({
            where: { uid: userId },
            data: { 
                isActive: false,
                updatedAt: new Date()
            },
            select: {
                uid: true,
                displayName: true,
                isActive: true
            }
        });

        res.json({
            success: true,
            message: "Profile deactivated successfully",
            data: updatedUser
        });

    } catch (error) {
        console.error("Error deactivating profile:", error);
        res.status(500).json({
            success: false,
            error: "Failed to deactivate profile",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;