import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  validateProgressEntry,
  validateUserId
} from '../middleware/validation.js';

const router = express.Router();

// Mock data for study progress
const mockProgress = {
  user1: [
    {
      id: '1',
      userId: 'user1',
      module: 'COMS3011',
      topic: 'Design Patterns',
      hoursStudied: 8.5,
      confidence: 4,
      notes:
        'Covered Singleton, Factory, and Observer patterns. Need more practice with State pattern.',
      date: '2024-01-20T10:00:00Z'
    },
    {
      id: '2',
      userId: 'user1',
      module: 'COMS3011',
      topic: 'Software Architecture',
      hoursStudied: 6.0,
      confidence: 3,
      notes:
        'Reviewed MVC, MVP, and MVVM architectures. Still confused about when to use each.',
      date: '2024-01-19T14:00:00Z'
    },
    {
      id: '3',
      userId: 'user1',
      module: 'MATH2001',
      topic: 'Linear Algebra',
      hoursStudied: 4.5,
      confidence: 5,
      notes:
        'Matrix operations and determinants are clear now. Ready for the exam.',
      date: '2024-01-18T16:00:00Z'
    }
  ],
  user2: [
    {
      id: '4',
      userId: 'user2',
      module: 'COMS3011',
      topic: 'Design Patterns',
      hoursStudied: 12.0,
      confidence: 4,
      notes:
        'Completed all design pattern exercises. Working on final project implementation.',
      date: '2024-01-20T11:00:00Z'
    }
  ]
};

/**
 * @route   POST /api/progress
 * @desc    Create or update study progress entry
 * @access  Private
 */
router.post('/', verifyToken, validateProgressEntry, (req, res) => {
  try {
    const { module, topic, hours, confidence, notes } = req.body;

    const newProgress = {
      id: Date.now().toString(),
      userId: req.user.uid,
      module: module.toUpperCase(),
      topic,
      hoursStudied: parseFloat(hours),
      confidence: confidence || 3,
      notes: notes || '',
      date: new Date().toISOString()
    };

    // Initialize user progress array if it doesn't exist
    if (!mockProgress[req.user.uid]) {
      mockProgress[req.user.uid] = [];
    }

    mockProgress[req.user.uid].push(newProgress);

    res.status(201).json({
      success: true,
      data: newProgress,
      message: 'Progress entry created successfully'
    });
  } catch (error) {
    console.error('Error creating progress entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create progress entry',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/progress/:userId
 * @desc    Get study progress for a specific user
 * @access  Private
 */
router.get('/:userId', verifyToken, validateUserId, (req, res) => {
  try {
    const { userId } = req.params;
    const { module: moduleFilter, limit = 50 } = req.query;

    // Users can only view their own progress
    if (userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'You can only view your own progress'
      });
    }

    let userProgress = mockProgress[userId] || [];

    // Filter by module if specified
    if (moduleFilter) {
      userProgress = userProgress.filter(
        entry => entry.module === moduleFilter.toUpperCase()
      );
    }

    // Sort by date (newest first)
    userProgress.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Apply limit
    if (limit && !isNaN(limit)) {
      userProgress = userProgress.slice(0, parseInt(limit));
    }

    // Calculate summary statistics
    const totalHours = userProgress.reduce(
      (sum, entry) => sum + entry.hoursStudied,
      0
    );
    const avgConfidence =
      userProgress.length > 0
        ? userProgress.reduce((sum, entry) => sum + entry.confidence, 0) /
          userProgress.length
        : 0;

    const modules = [...new Set(userProgress.map(entry => entry.module))];

    res.json({
      success: true,
      data: userProgress,
      summary: {
        totalEntries: userProgress.length,
        totalHours,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        modules,
        lastUpdated: userProgress.length > 0 ? userProgress[0].date : null
      },
      filters: {
        module: moduleFilter || 'all',
        limit: parseInt(limit) || 50
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/progress
 * @desc    Get current user's progress summary
 * @access  Private
 */
router.get('/', verifyToken, (req, res) => {
  try {
    const userProgress = mockProgress[req.user.uid] || [];

    // Calculate summary statistics
    const totalHours = userProgress.reduce(
      (sum, entry) => sum + entry.hoursStudied,
      0
    );
    const avgConfidence =
      userProgress.length > 0
        ? userProgress.reduce((sum, entry) => sum + entry.confidence, 0) /
          userProgress.length
        : 0;

    const modules = [...new Set(userProgress.map(entry => entry.module))];
    const recentEntries = userProgress
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalEntries: userProgress.length,
          totalHours,
          averageConfidence: Math.round(avgConfidence * 100) / 100,
          modules,
          lastUpdated: userProgress.length > 0 ? userProgress[0].date : null
        },
        recentEntries
      }
    });
  } catch (error) {
    console.error('Error fetching progress summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch progress summary',
      message: error.message
    });
  }
});

export default router;
