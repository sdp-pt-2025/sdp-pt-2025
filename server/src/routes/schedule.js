import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validateScheduleEvent } from '../middleware/validation.js';

const router = express.Router();

// Mock Google Calendar data
const mockCalendarEvents = [
  {
    id: 'event1',
    title: 'COMS3011 Study Session',
    description: 'Group study session for Advanced Software Engineering',
    startISO: '2024-01-22T14:00:00Z',
    endISO: '2024-01-22T16:00:00Z',
    location: 'Library Study Room 3',
    attendees: [
      { email: 'alice.johnson@student.edu', responseStatus: 'accepted' },
      { email: 'bob.smith@student.edu', responseStatus: 'accepted' },
      { email: 'carol.davis@student.edu', responseStatus: 'needsAction' }
    ],
    creator: {
      email: 'alice.johnson@student.edu',
      displayName: 'Alice Johnson'
    },
    created: '2024-01-15T10:00:00Z',
    updated: '2024-01-20T09:00:00Z'
  },
  {
    id: 'event2',
    title: 'MATH2001 Problem Solving',
    description: 'Mathematics study group focusing on linear algebra',
    startISO: '2024-01-23T13:00:00Z',
    endISO: '2024-01-23T15:00:00Z',
    location: 'Math Building Room 201',
    attendees: [
      { email: 'carol.davis@student.edu', responseStatus: 'accepted' },
      { email: 'frank.miller@student.edu', responseStatus: 'accepted' },
      { email: 'grace.lee@student.edu', responseStatus: 'accepted' }
    ],
    creator: {
      email: 'carol.davis@student.edu',
      displayName: 'Carol Davis'
    },
    created: '2024-01-10T14:00:00Z',
    updated: '2024-01-18T16:00:00Z'
  },
  {
    id: 'event3',
    title: 'Individual Study - COMS3011',
    description: 'Review design patterns and prepare for upcoming exam',
    startISO: '2024-01-24T10:00:00Z',
    endISO: '2024-01-24T12:00:00Z',
    location: 'Home',
    attendees: [
      { email: 'alice.johnson@student.edu', responseStatus: 'accepted' }
    ],
    creator: {
      email: 'alice.johnson@student.edu',
      displayName: 'Alice Johnson'
    },
    created: '2024-01-20T08:00:00Z',
    updated: '2024-01-20T08:00:00Z'
  }
];

/**
 * @route   POST /api/schedule
 * @desc    Create a new calendar event (mock implementation)
 * @access  Private
 */
router.post('/', verifyToken, validateScheduleEvent, (req, res) => {
  try {
    const { title, startISO, endISO, description, attendees } = req.body;

    const newEvent = {
      id: `event${Date.now()}`,
      title,
      description: description || '',
      startISO,
      endISO,
      location: 'TBD',
      attendees: attendees || [],
      creator: {
        email: req.user.email,
        displayName: req.user.name || 'Anonymous'
      },
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    // Add creator as attendee if not already included
    const creatorEmail = req.user.email;
    if (
      creatorEmail &&
      !newEvent.attendees.some(a => a.email === creatorEmail)
    ) {
      newEvent.attendees.unshift({
        email: creatorEmail,
        responseStatus: 'accepted'
      });
    }

    mockCalendarEvents.push(newEvent);

    res.status(201).json({
      success: true,
      data: newEvent,
      message: 'Calendar event created successfully (mock)',
      note: 'This is a mock implementation. Real Google Calendar integration will be added in the next sprint.',
      mock: true
    });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create calendar event',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/schedule
 * @desc    Get calendar events (mock implementation)
 * @access  Private
 */
router.get('/', verifyToken, (req, res) => {
  try {
    const { timeMin, timeMax, maxResults = 10 } = req.query;

    let filteredEvents = [...mockCalendarEvents];

    // Filter by time range if specified
    if (timeMin) {
      const minDate = new Date(timeMin);
      if (!isNaN(minDate.getTime())) {
        filteredEvents = filteredEvents.filter(
          event => new Date(event.startISO) >= minDate
        );
      }
    }

    if (timeMax) {
      const maxDate = new Date(timeMax);
      if (!isNaN(maxDate.getTime())) {
        filteredEvents = filteredEvents.filter(
          event => new Date(event.startISO) <= maxDate
        );
      }
    }

    // Sort by start time (earliest first)
    filteredEvents.sort((a, b) => new Date(a.startISO) - new Date(b.startISO));

    // Apply max results limit
    if (maxResults && !isNaN(maxResults)) {
      filteredEvents = filteredEvents.slice(0, parseInt(maxResults));
    }

    res.json({
      success: true,
      data: filteredEvents,
      count: filteredEvents.length,
      total: mockCalendarEvents.length,
      filters: {
        timeMin: timeMin || 'none',
        timeMax: timeMax || 'none',
        maxResults: parseInt(maxResults) || 10
      },
      note: 'This is a mock implementation. Real Google Calendar integration will be added in the next sprint.',
      mock: true
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calendar events',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/schedule/:id
 * @desc    Get a specific calendar event by ID
 * @access  Private
 */
router.get('/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const event = mockCalendarEvents.find(e => e.id === id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Calendar event not found'
      });
    }

    res.json({
      success: true,
      data: event,
      note: 'This is a mock implementation. Real Google Calendar integration will be added in the next sprint.',
      mock: true
    });
  } catch (error) {
    console.error('Error fetching calendar event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch calendar event',
      message: error.message
    });
  }
});

export default router;
