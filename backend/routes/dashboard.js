import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @route   GET /api/dashboard
 * @desc    Get comprehensive dashboard data for user
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

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { uid: userId },
            select: {
                uid: true,
                displayName: true,
                photoURL: true,
                isActive: true
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: "User not found"
            });
        }

        // Get current date range for "this week" calculations
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday, standard.
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        // Parallel queries for better performance
        const [
            studySessions,
            progressRecords,
            groupMemberships,
            createdGroups,
            upcomingSessions,
            notifications
        ] = await Promise.all([
            // Get all study sessions
            prisma.studySession.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50
            }),

            // Get progress tracking records
            prisma.progressTracking.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' }
            }),

            // Get group memberships with group details
            prisma.groupMember.findMany({
                where: { userId },
                include: {
                    group: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            module: true,
                            status: true,
                            memberCount: true,
                            createdAt: true
                        }
                    }
                }
            }),

            // Get groups created by user
            prisma.studyGroup.findMany({
                where: { createdBy: userId },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    module: true,
                    status: true,
                    memberCount: true,
                    createdAt: true
                }
            }),

            // Get upcoming study sessions
            prisma.studySession.findMany({
                where: {
                    userId,
                    startTime: {
                        gte: now
                    },
                    completed: false
                },
                orderBy: { startTime: 'asc' },
                take: 10
            }),

            // Get recent notifications
            prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        // Calculate statistics
        const stats = {
            // Study time (in minutes)
            totalStudyTime: studySessions.reduce((total, session) => {
                return total + (session.completed ? session.duration : 0);
            }, 0),

            // Sessions
            totalSessions: studySessions.length,
            completedSessions: studySessions.filter(s => s.completed).length,
            
            // Progress tracking
            totalProgressRecords: progressRecords.length,
            completedTopics: progressRecords.filter(p => p.status === 'completed').length,
            inProgressTopics: progressRecords.filter(p => p.status === 'in_progress').length,
            
            // Groups
            totalGroups: groupMemberships.length + createdGroups.length,
            groupsCreated: createdGroups.length,
            activeGroups: [...groupMemberships.map(gm => gm.group), ...createdGroups]
                .filter(g => g.status === 'active').length
        };

        // Generate recent activity from multiple sources
        const recentActivity = [];

        // Add completed study sessions
        studySessions
            .filter(session => session.completed)
            .slice(0, 5)
            .forEach(session => {
                recentActivity.push({
                    type: 'study_session',
                    title: 'Study Session Completed',
                    description: `${session.topic} - ${Math.floor(session.duration / 60)}h ${session.duration % 60}m`,
                    createdAt: session.updatedAt || session.createdAt,
                    metadata: {
                        module: session.module,
                        duration: session.duration,
                        rating: session.rating
                    }
                });
            });

        // Add progress updates
        progressRecords
            .filter(progress => progress.status === 'completed')
            .slice(0, 3)
            .forEach(progress => {
                recentActivity.push({
                    type: 'progress_update',
                    title: 'Topic Completed',
                    description: `${progress.topic} in ${progress.module}`,
                    createdAt: progress.updatedAt,
                    metadata: {
                        module: progress.module,
                        completionPercentage: progress.completionPercentage,
                        confidence: progress.confidence
                    }
                });
            });

        // Add group joins
        groupMemberships
            .slice(0, 3)
            .forEach(membership => {
                recentActivity.push({
                    type: 'group_join',
                    title: 'Joined Study Group',
                    description: `${membership.group.name} - ${membership.group.module}`,
                    createdAt: membership.group.createdAt,
                    metadata: {
                        groupId: membership.group.id,
                        module: membership.group.module
                    }
                });
            });

        // Add groups created
        createdGroups
            .slice(0, 2)
            .forEach(group => {
                recentActivity.push({
                    type: 'group_create',
                    title: 'Created Study Group',
                    description: `${group.name} - ${group.module}`,
                    createdAt: group.createdAt,
                    metadata: {
                        groupId: group.id,
                        memberCount: group.memberCount
                    }
                });
            });

        // Sort activity by date and limit
        recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const limitedActivity = recentActivity.slice(0, 10);

        // Prepare progress data by module
        const moduleProgress = progressRecords.reduce((acc, record) => {
            if (!acc[record.module]) {
                acc[record.module] = {
                    module: record.module,
                    totalTopics: 0,
                    completedTopics: 0,
                    studyHours: 0,
                    completionPercentage: 0
                };
            }
            
            acc[record.module].totalTopics++;
            acc[record.module].studyHours += record.studyHours || 0;
            
            if (record.status === 'completed') {
                acc[record.module].completedTopics++;
            }
            
            return acc;
        }, {});

        // Calculate completion percentages for modules
        Object.values(moduleProgress).forEach(module => {
            module.completionPercentage = module.totalTopics > 0 
                ? Math.round((module.completedTopics / module.totalTopics) * 100)
                : 0;
        });

        // This week's study time
        const thisWeekSessions = studySessions.filter(session => {
            const sessionDate = new Date(session.createdAt);
            return sessionDate >= startOfWeek && sessionDate < endOfWeek && session.completed;
        });

        const thisWeekStats = {
            studyTime: thisWeekSessions.reduce((total, session) => total + session.duration, 0),
            sessions: thisWeekSessions.length,
            topicsCompleted: progressRecords.filter(record => {
                const updateDate = new Date(record.updatedAt);
                return updateDate >= startOfWeek && updateDate < endOfWeek && record.status === 'completed';
            }).length
        };

        // Format response
        const dashboardData = {
            user: {
                uid: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL
            },
            stats,
            thisWeekStats,
            recentActivity: limitedActivity,
            upcomingSessions,
            progress: {
                modules: Object.values(moduleProgress).slice(0, 5) // Show top 5 modules
            },
            recentSessions: studySessions
                .filter(s => s.completed)
                .slice(0, 5)
                .map(session => ({
                    id: session.id,
                    topic: session.topic,
                    module: session.module,
                    duration: session.duration,
                    rating: session.rating,
                    completedAt: session.updatedAt,
                    sessionType: session.sessionType
                })),
            groups: {
                created: createdGroups.slice(0, 3),
                joined: groupMemberships.slice(0, 5).map(gm => gm.group)
            },
            notifications: notifications
                .filter(n => !n.read)
                .slice(0, 5)
                .map(notification => ({
                    id: notification.id,
                    title: notification.title,
                    body: notification.body,
                    type: notification.type,
                    createdAt: notification.createdAt
                }))
        };

        res.json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch dashboard data",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/dashboard/weekly-stats
 * @desc    Get detailed weekly statistics
 * @access  Public (no auth)
 */
router.get("/weekly-stats", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;
        const weekOffset = parseInt(req.query.weekOffset) || 0; 

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        // Calculate week start/end dates
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (weekOffset * 7)); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        // Get weekly data
        const [weeklyStudySessions, weeklyProgress] = await Promise.all([
            prisma.studySession.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfWeek,
                        lt: endOfWeek
                    }
                },
                orderBy: { createdAt: 'asc' }
            }),
            
            prisma.progressTracking.findMany({
                where: {
                    userId,
                    updatedAt: {
                        gte: startOfWeek,
                        lt: endOfWeek
                    }
                }
            })
        ]);

        // Calculate daily breakdown
        const dailyStats = {};
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const dayKey = day.toISOString().split('T')[0];
            
            dailyStats[dayKey] = {
                date: day.toISOString(),
                dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
                studyTime: 0,
                sessions: 0,
                completedSessions: 0,
                topicsCompleted: 0
            };
        }

        // Process study sessions
        weeklyStudySessions.forEach(session => {
            const sessionDate = session.createdAt.toISOString().split('T')[0];
            if (dailyStats[sessionDate]) {
                dailyStats[sessionDate].sessions++;
                if (session.completed) {
                    dailyStats[sessionDate].completedSessions++;
                    dailyStats[sessionDate].studyTime += session.duration || 0;
                }
            }
        });

        // Process progress records
        weeklyProgress.forEach(progress => {
            const progressDate = progress.updatedAt.toISOString().split('T')[0];
            if (dailyStats[progressDate] && progress.status === 'completed') {
                dailyStats[progressDate].topicsCompleted++;
            }
        });

        // Calculate weekly totals
        const weeklyTotals = {
            totalStudyTime: Object.values(dailyStats).reduce((sum, day) => sum + day.studyTime, 0),
            totalSessions: Object.values(dailyStats).reduce((sum, day) => sum + day.sessions, 0),
            completedSessions: Object.values(dailyStats).reduce((sum, day) => sum + day.completedSessions, 0),
            topicsCompleted: Object.values(dailyStats).reduce((sum, day) => sum + day.topicsCompleted, 0),
            averageDailyStudyTime: Math.round(Object.values(dailyStats).reduce((sum, day) => sum + day.studyTime, 0) / 7),
            studyDays: Object.values(dailyStats).filter(day => day.studyTime > 0).length
        };

        res.json({
            success: true,
            data: {
                weekRange: {
                    start: startOfWeek.toISOString(),
                    end: endOfWeek.toISOString(),
                    weekOffset
                },
                weeklyTotals,
                dailyBreakdown: Object.values(dailyStats)
            }
        });

    } catch (error) {
        console.error("Error fetching weekly stats:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch weekly statistics",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/dashboard/monthly-stats
 * @desc    Get detailed monthly statistics
 * @access  Public (no auth)
 */
router.get("/monthly-stats", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = parseInt(req.query.month) || new Date().getMonth(); // 0-based

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        // Calculate month boundaries
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 1);

        // Get monthly data
        const [monthlySessions, monthlyProgress, monthlyGroups] = await Promise.all([
            prisma.studySession.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfMonth,
                        lt: endOfMonth
                    }
                },
                orderBy: { createdAt: 'asc' }
            }),
            
            prisma.progressTracking.findMany({
                where: {
                    userId,
                    updatedAt: {
                        gte: startOfMonth,
                        lt: endOfMonth
                    }
                }
            }),

            prisma.groupMember.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: startOfMonth,
                        lt: endOfMonth
                    }
                },
                include: {
                    group: {
                        select: {
                            name: true,
                            module: true
                        }
                    }
                }
            })
        ]);

        // Calculate monthly stats by module
        const moduleStats = {};
        
        monthlySessions.forEach(session => {
            if (!moduleStats[session.module]) {
                moduleStats[session.module] = {
                    module: session.module,
                    studyTime: 0,
                    sessions: 0,
                    completedSessions: 0,
                    topicsCompleted: 0,
                    averageRating: 0,
                    totalRatings: 0
                };
            }
            
            moduleStats[session.module].sessions++;
            if (session.completed) {
                moduleStats[session.module].completedSessions++;
                moduleStats[session.module].studyTime += session.duration || 0;
                
                if (session.rating) {
                    moduleStats[session.module].totalRatings += session.rating;
                }
            }
        });

        monthlyProgress.forEach(progress => {
            if (progress.status === 'completed' && moduleStats[progress.module]) {
                moduleStats[progress.module].topicsCompleted++;
            }
        });

        // Calculate average ratings
        Object.values(moduleStats).forEach(module => {
            if (module.completedSessions > 0) {
                module.averageRating = Math.round((module.totalRatings / module.completedSessions) * 10) / 10;
            }
            delete module.totalRatings; 
        });

        // Calculate overall monthly totals
        const monthlyTotals = {
            totalStudyTime: Object.values(moduleStats).reduce((sum, module) => sum + module.studyTime, 0),
            totalSessions: Object.values(moduleStats).reduce((sum, module) => sum + module.sessions, 0),
            completedSessions: Object.values(moduleStats).reduce((sum, module) => sum + module.completedSessions, 0),
            topicsCompleted: Object.values(moduleStats).reduce((sum, module) => sum + module.topicsCompleted, 0),
            groupsJoined: monthlyGroups.length,
            uniqueModules: Object.keys(moduleStats).length
        };

        res.json({
            success: true,
            data: {
                monthInfo: {
                    year,
                    month,
                    monthName: new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long' }),
                    start: startOfMonth.toISOString(),
                    end: endOfMonth.toISOString()
                },
                monthlyTotals,
                moduleBreakdown: Object.values(moduleStats).sort((a, b) => b.studyTime - a.studyTime),
                groupsJoined: monthlyGroups.map(gm => ({
                    groupName: gm.group.name,
                    module: gm.group.module,
                    joinedAt: gm.createdAt
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching monthly stats:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch monthly statistics",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/dashboard/study-sessions
 * @desc    Get paginated study sessions with filtering
 * @access  Public (no auth)
 */
router.get("/study-sessions", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const module = req.query.module;
        const completed = req.query.completed !== undefined ? req.query.completed === 'true' : undefined;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause = { userId };
        if (module) whereClause.module = module;
        if (completed !== undefined) whereClause.completed = completed;

        // Build order by clause
        const orderByClause = { [sortBy]: sortOrder };

        // Get sessions and total count
        const [sessions, totalCount] = await Promise.all([
            prisma.studySession.findMany({
                where: whereClause,
                orderBy: orderByClause,
                skip,
                take: limit,
                select: {
                    id: true,
                    topic: true,
                    module: true,
                    duration: true,
                    completed: true,
                    rating: true,
                    sessionType: true,
                    startTime: true,
                    endTime: true,
                    createdAt: true,
                    updatedAt: true
                }
            }),
            
            prisma.studySession.count({
                where: whereClause
            })
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            success: true,
            data: {
                sessions,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalCount,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                    limit
                }
            }
        });

    } catch (error) {
        console.error("Error fetching study sessions:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch study sessions",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * @route   GET /api/dashboard/progress-overview
 * @desc    Get detailed progress overview across all modules
 * @access  Public (no auth)
 */
router.get("/progress-overview", async (req, res) => {
    try {
        const userId = req.user?.uid || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "Missing userId"
            });
        }

        // Get all progress records and related study sessions
        const [progressRecords, studySessions] = await Promise.all([
            prisma.progressTracking.findMany({
                where: { userId },
                orderBy: { updatedAt: 'desc' }
            }),

            prisma.studySession.findMany({
                where: { 
                    userId,
                    completed: true 
                }
            })
        ]);

        // Group by module
        const moduleOverview = {};

        // Process progress records
        progressRecords.forEach(record => {
            if (!moduleOverview[record.module]) {
                moduleOverview[record.module] = {
                    module: record.module,
                    topics: [],
                    totalTopics: 0,
                    completedTopics: 0,
                    inProgressTopics: 0,
                    notStartedTopics: 0,
                    totalStudyHours: 0,
                    averageConfidence: 0,
                    lastUpdated: null,
                    completionPercentage: 0
                };
            }

            const moduleData = moduleOverview[record.module];
            
            moduleData.topics.push({
                topic: record.topic,
                status: record.status,
                completionPercentage: record.completionPercentage || 0,
                studyHours: record.studyHours || 0,
                confidence: record.confidence || 0,
                lastUpdated: record.updatedAt,
                notes: record.notes
            });

            moduleData.totalTopics++;
            moduleData.totalStudyHours += record.studyHours || 0;
            
            if (record.status === 'completed') {
                moduleData.completedTopics++;
            } else if (record.status === 'in_progress') {
                moduleData.inProgressTopics++;
            } else {
                moduleData.notStartedTopics++;
            }

            if (!moduleData.lastUpdated || record.updatedAt > moduleData.lastUpdated) {
                moduleData.lastUpdated = record.updatedAt;
            }
        });

        // Add study session data
        studySessions.forEach(session => {
            if (moduleOverview[session.module]) {
                // Study hours are calculated from progress records, 
                // but we can add session-specific insights here if needed
            }
        });

        // Calculate averages and percentages
        Object.values(moduleOverview).forEach(module => {
            // Completion percentage
            module.completionPercentage = module.totalTopics > 0 
                ? Math.round((module.completedTopics / module.totalTopics) * 100)
                : 0;

            // Average confidence
            const confidenceScores = module.topics
                .filter(topic => topic.confidence > 0)
                .map(topic => topic.confidence);
            
            module.averageConfidence = confidenceScores.length > 0
                ? Math.round((confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length) * 10) / 10
                : 0;

            // Sort topics by last updated
            module.topics.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        });

        // Sort modules by completion percentage (descending)
        const sortedModules = Object.values(moduleOverview)
            .sort((a, b) => b.completionPercentage - a.completionPercentage);

        // Calculate overall statistics
        const overallStats = {
            totalModules: sortedModules.length,
            totalTopics: sortedModules.reduce((sum, module) => sum + module.totalTopics, 0),
            completedTopics: sortedModules.reduce((sum, module) => sum + module.completedTopics, 0),
            inProgressTopics: sortedModules.reduce((sum, module) => sum + module.inProgressTopics, 0),
            totalStudyHours: sortedModules.reduce((sum, module) => sum + module.totalStudyHours, 0),
            averageModuleCompletion: sortedModules.length > 0
                ? Math.round(sortedModules.reduce((sum, module) => sum + module.completionPercentage, 0) / sortedModules.length)
                : 0,
            fullyCompletedModules: sortedModules.filter(module => module.completionPercentage === 100).length
        };

        res.json({
            success: true,
            data: {
                overallStats,
                modules: sortedModules
            }
        });

    } catch (error) {
        console.error("Error fetching progress overview:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch progress overview",
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

export default router;