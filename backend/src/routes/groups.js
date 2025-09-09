import express from 'express';

const router = express.Router();

// Mock data for study groups
const mockGroups = [
  {
    id: '1',
    name: 'COMS3011 Study Group',
    description: 'Advanced Software Engineering study group',
    module: 'COMS3011',
    maxMembers: 8,
    currentMembers: 5,
    members: [
      { id: 'user1', name: 'Alice Johnson', role: 'admin' },
      { id: 'user2', name: 'Bob Smith', role: 'member' },
      { id: 'user3', name: 'Carol Davis', role: 'member' },
      { id: 'user4', name: 'David Wilson', role: 'member' },
      { id: 'user5', name: 'Eve Brown', role: 'member' }
    ],
    schedule: ['Monday 2-4pm', 'Wednesday 3-5pm'],
    location: 'Library Study Room 3',
    createdAt: '2024-01-15T10:00:00Z',
    createdBy: 'user1'
  }
];

// Mock data for group messages
const mockMessages = {
  1: [
    {
      id: 'msg1',
      groupId: '1',
      userId: 'user1',
      userName: 'Alice Johnson',
      message: 'Hi everyone! Ready for our study session tomorrow?',
      timestamp: '2024-01-20T09:00:00Z'
    }
  ]
};

/**
 * @route   POST /api/groups
 * @desc    Create a new study group
 * @access  Private
 */
router.post('/', (req, res) => {
  try {
    const { name, description, module, maxMembers, schedule, location } = req.body;

    const newGroup = {
      id: Date.now().toString(),
      name,
      description: description || '',
      module: module.toUpperCase(),
      maxMembers: maxMembers || 8,
      currentMembers: 1,
      members: [{ id: req.user.uid, name: req.user.name || 'Anonymous', role: 'admin' }],
      schedule: schedule || [],
      location: location || '',
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid
    };

    mockGroups.push(newGroup);

    res.status(201).json({
      success: true,
      data: newGroup,
      message: 'Study group created successfully'
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create study group',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/groups
 * @desc    Get all study groups
 * @access  Private
 */
router.get('/', (req, res) => {
  try {
    const { module: moduleFilter } = req.query;

    let filteredGroups = mockGroups;

    if (moduleFilter) {
      filteredGroups = mockGroups.filter(group => 
        group.module.toLowerCase().includes(moduleFilter.toLowerCase())
      );
    }

    res.json({
      success: true,
      data: filteredGroups,
      count: filteredGroups.length
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study groups',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/groups/:id
 * @desc    Get a specific study group
 * @access  Private
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const group = mockGroups.find(g => g.id === id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    res.json({
      success: true,
      data: group
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study group',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/groups/:id/join
 * @desc    Join a study group
 * @access  Private
 */
router.post('/:id/join', (req, res) => {
  try {
    const { id } = req.params;
    const group = mockGroups.find(g => g.id === id);

    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is already a member
    const isMember = group.members.some(member => member.id === req.user.uid);
    if (isMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this group'
      });
    }

    // Check if group is full
    if (group.currentMembers >= group.maxMembers) {
      return res.status(400).json({
        success: false,
        error: 'Study group is full'
      });
    }

    // Add user to group
    group.members.push({
      id: req.user.uid,
      name: req.user.name || 'Anonymous',
      role: 'member'
    });
    group.currentMembers++;

    res.json({
      success: true,
      data: group,
      message: 'Successfully joined study group'
    });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join study group',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/groups/:id/message
 * @desc    Send a message to a study group
 * @access  Private
 */
router.post('/:id/message', (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const group = mockGroups.find(g => g.id === id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is a member
    const isMember = group.members.some(member => member.id === req.user.uid);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to send messages'
      });
    }

    const newMessage = {
      id: Date.now().toString(),
      groupId: id,
      userId: req.user.uid,
      userName: req.user.name || 'Anonymous',
      message,
      timestamp: new Date().toISOString()
    };

    if (!mockMessages[id]) {
      mockMessages[id] = [];
    }
    mockMessages[id].push(newMessage);

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/groups/:id/messages
 * @desc    Get messages from a study group
 * @access  Private
 */
router.get('/:id/messages', (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const group = mockGroups.find(g => g.id === id);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is a member
    const isMember = group.members.some(member => member.id === req.user.uid);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to view messages'
      });
    }

    const messages = mockMessages[id] || [];
    const limitedMessages = messages.slice(-parseInt(limit));

    res.json({
      success: true,
      data: limitedMessages,
      count: limitedMessages.length,
      total: messages.length
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
      message: error.message
    });
  }
});

export default router;
