import express from "express";

const router = express.Router();

// Mock data for study progress
const mockProgress = [
    {
        id: "1",
        userId: "user1",
        topic: "Design Patterns",
        module: "COMS3011",
        hours: 2.5,
        notes: "Covered Singleton, Factory, and Observer patterns",
        completed: true,
        date: "2024-01-20T10:00:00Z",
    },
    {
        id: "2",
        userId: "user1",
        topic: "Database Design",
        module: "COMS3028",
        hours: 1.5,
        notes: "ER diagrams and normalization",
        completed: false,
        date: "2024-01-19T14:00:00Z",
    },
];

/**
 * @route   POST /api/progress
 * @desc    Log study progress
 * @access  Private
 */
router.post("/", (req, res) => {
    try {
        const { topic, hours, module, notes, completed = false } = req.body;

        const newProgress = {
            id: Date.now().toString(),
            userId: req.user.uid,
            topic,
            module: module.toUpperCase(),
            hours: parseFloat(hours),
            notes: notes || "",
            completed,
            date: new Date().toISOString(),
        };

        mockProgress.push(newProgress);

        res.status(201).json({
            success: true,
            data: newProgress,
            message: "Study progress logged successfully",
        });
    } catch (error) {
        console.error("Error logging progress:", error);
        res.status(500).json({
            success: false,
            error: "Failed to log study progress",
            message: error.message,
        });
    }
});

/**
 * @route   GET /api/progress/:userId
 * @desc    Get user's study progress
 * @access  Private
 */
router.get("/:userId", (req, res) => {
    try {
        const { userId } = req.params;
        const { module, limit = 50 } = req.query;

        // Users can only view their own progress
        if (userId !== req.user.uid) {
            return res.status(403).json({
                success: false,
                error: "You can only view your own progress",
            });
        }

        let userProgress = mockProgress.filter(
            (progress) => progress.userId === userId,
        );

        if (module) {
            userProgress = userProgress.filter((progress) =>
                progress.module.toLowerCase().includes(module.toLowerCase()),
            );
        }

        const limitedProgress = userProgress.slice(-parseInt(limit));

        const totalHours = userProgress.reduce(
            (sum, progress) => sum + progress.hours,
            0,
        );
        const completedTopics = userProgress.filter(
            (progress) => progress.completed,
        ).length;

        res.json({
            success: true,
            data: {
                progress: limitedProgress,
                summary: {
                    totalHours,
                    completedTopics,
                    totalTopics: userProgress.length,
                    averageHoursPerSession:
                        totalHours / userProgress.length || 0,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching progress:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch study progress",
            message: error.message,
        });
    }
});

export default router;
