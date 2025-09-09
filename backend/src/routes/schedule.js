import express from 'express';

const router = express.Router();

// Mock data for study sessions
const mockSessions = [
  {
    id: '1',
    title: 'COMS3011 Design Patterns Review',
    description: 'Review of Singleton, Factory, and Observer patterns',
    module: 'COMS3011',
    startTime: '2024-01-22T14:00:00Z',
    endTime: '2024-01-22T16:00:00Z',
    location: 'Library Study Room 3',
    attendees: ['user1', 'user2', 'user3'],
    createdBy: 'user1',
    createdAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '2',
    title: 'MATH2001 Problem Solving',
    description: 'Practice problems for upcoming exam',
    module: 'MATH2001',
    startTime: '2024-01-23T10:00:00Z',
    endTime: '2024-01-23T12:00:00Z',
    location: 'Math Building Room 201',
    attendees: ['user1', 'user3'],
    createdBy: 'user3',
    createdAt: '2024-01-19T15:00:00Z'
  }
];

/**
 * @route   POST /api/schedule
 * @desc    Create a study session
 * @access  Private
 */
router.post('/', (req, res) => {
  try {
    const { title, description, module, startTime, endTime, location, attendees } = req.body;

    const newSession = {
      id: Date.now().toString(),
      title,
      description: description || '',
      module: module.toUpperCase(),
      startTime,
      endTime,
      location: location || '',
      attendees: attendees || [req.user.uid],
      createdBy: req.user.uid,
      createdAt: new Date().toISOString()
    };

    mockSessions.push(newSession);

    res.status(201).json({
      success: true,
      data: newSession,
      message: 'Study session created successfully'
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create study session',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/schedule
 * @desc    Get study sessions
 * @access  Private
 */
router.get('/', (req, res) => {
  try {
    const { module, startDate, endDate, limit = 50 } = req.query;

    let filteredSessions = mockSessions;

    // Filter by module
    if (module) {
      filteredSessions = filteredSessions.filter(session =>
        session.module.toLowerCase().includes(module.toLowerCase())
      );
    }

    // Filter by date range
    if (startDate) {
      filteredSessions = filteredSessions.filter(session =>
        new Date(session.startTime) >= new Date(startDate)
      );
    }

    if (endDate) {
      filteredSessions = filteredSessions.filter(session =>
        new Date(session.startTime) <= new Date(endDate)
      );
    }

    // Filter sessions where user is an attendee
    filteredSessions = filteredSessions.filter(session =>
      session.attendees.includes(req.user.uid)
    );

    const limitedSessions = filteredSessions.slice(-parseInt(limit));

    res.json({
      success: true,
      data: limitedSessions,
      count: limitedSessions.length,
      total: filteredSessions.length
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study sessions',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/schedule/:id
 * @desc    Get a specific study session
 * @access  Private
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const session = mockSessions.find(s => s.id === id);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Study session not found'
      });
    }

    // Check if user is an attendee
    if (!session.attendees.includes(req.user.uid)) {
      return res.status(403).json({
        success: false,
        error: 'You are not an attendee of this session'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study session',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/schedule/:id
 * @desc    Delete a study session
 * @access  Private
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sessionIndex = mockSessions.findIndex(s => s.id === id);

    if (sessionIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Study session not found'
      });
    }

    const session = mockSessions[sessionIndex];

    // Only creator can delete the session
    if (session.createdBy !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete sessions you created'
      });
    }

    mockSessions.splice(sessionIndex, 1);

    res.json({
      success: true,
      message: 'Study session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete study session',
      message: error.message
    });
  }
});

export default router;
