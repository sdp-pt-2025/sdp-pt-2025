import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin if not already initialized
if (admin.apps.length === 0) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin initialized for seeding');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    process.exit(1);
  }
}

const db = admin.firestore();

/**
 * Sample data for seeding the database
 */
const sampleData = {
  users: [
    {
      uid: 'user1',
      email: 'john.doe@students.wits.ac.za',
      displayName: 'John Doe',
      photoURL: 'https://via.placeholder.com/150',
      university: 'University of the Witwatersrand',
      studentId: '12345678',
      yearOfStudy: 3,
      faculty: 'Engineering and the Built Environment',
      modules: ['COMS3011', 'COMS3028', 'MATH101', 'PHYS101'],
      studyPreferences: {
        preferredStudyTimes: ['morning', 'afternoon'],
        studyStyle: 'group',
        locationPreference: 'both',
        maxGroupSize: 6,
        subjects: ['Computer Science', 'Mathematics', 'Physics']
      },
      availability: {
        monday: { start: '09:00', end: '17:00', available: true },
        tuesday: { start: '09:00', end: '17:00', available: true },
        wednesday: { start: '09:00', end: '17:00', available: true },
        thursday: { start: '09:00', end: '17:00', available: true },
        friday: { start: '09:00', end: '15:00', available: true },
        saturday: { start: '10:00', end: '16:00', available: true },
        sunday: { start: '10:00', end: '16:00', available: true }
      },
      fcmToken: 'sample_fcm_token_1',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'user2',
      email: 'jane.smith@students.wits.ac.za',
      displayName: 'Jane Smith',
      photoURL: 'https://via.placeholder.com/150',
      university: 'University of the Witwatersrand',
      studentId: '87654321',
      yearOfStudy: 2,
      faculty: 'Engineering and the Built Environment',
      modules: ['COMS3011', 'MATH101', 'STAT101'],
      studyPreferences: {
        preferredStudyTimes: ['afternoon', 'evening'],
        studyStyle: 'individual',
        locationPreference: 'indoor',
        maxGroupSize: 4,
        subjects: ['Computer Science', 'Mathematics', 'Statistics']
      },
      availability: {
        monday: { start: '14:00', end: '20:00', available: true },
        tuesday: { start: '14:00', end: '20:00', available: true },
        wednesday: { start: '14:00', end: '20:00', available: true },
        thursday: { start: '14:00', end: '20:00', available: true },
        friday: { start: '14:00', end: '18:00', available: true },
        saturday: { start: '09:00', end: '15:00', available: true },
        sunday: { start: '09:00', end: '15:00', available: true }
      },
      fcmToken: 'sample_fcm_token_2',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      uid: 'user3',
      email: 'mike.wilson@students.wits.ac.za',
      displayName: 'Mike Wilson',
      photoURL: 'https://via.placeholder.com/150',
      university: 'University of the Witwatersrand',
      studentId: '11223344',
      yearOfStudy: 4,
      faculty: 'Engineering and the Built Environment',
      modules: ['COMS3028', 'COMS3011', 'MATH201', 'PHYS201'],
      studyPreferences: {
        preferredStudyTimes: ['morning', 'afternoon'],
        studyStyle: 'both',
        locationPreference: 'outdoor',
        maxGroupSize: 8,
        subjects: ['Computer Science', 'Mathematics', 'Physics']
      },
      availability: {
        monday: { start: '08:00', end: '16:00', available: true },
        tuesday: { start: '08:00', end: '16:00', available: true },
        wednesday: { start: '08:00', end: '16:00', available: true },
        thursday: { start: '08:00', end: '16:00', available: true },
        friday: { start: '08:00', end: '14:00', available: true },
        saturday: { start: '10:00', end: '18:00', available: true },
        sunday: { start: '10:00', end: '18:00', available: true }
      },
      fcmToken: 'sample_fcm_token_3',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  studyGroups: [
    {
      id: 'group1',
      name: 'COMS3011 Algorithms Study Group',
      description: 'Weekly study group for COMS3011 Algorithms course. We focus on problem-solving and exam preparation.',
      module: 'COMS3011',
      topic: 'Algorithms and Data Structures',
      createdBy: 'user1',
      createdByName: 'John Doe',
      members: ['user1', 'user2', 'user3'],
      memberCount: 3,
      maxMembers: 6,
      isPublic: true,
      tags: ['algorithms', 'data-structures', 'exam-prep'],
      location: {
        type: 'campus',
        details: 'Library Study Room 3A',
        coordinates: { lat: -26.1929, lng: 28.0305 }
      },
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 'tuesday',
        time: '14:00',
        duration: 120,
        nextSession: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
      },
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'group2',
      name: 'MATH101 Calculus Study Group',
      description: 'Study group for MATH101 Calculus. We meet twice a week to work through problems and prepare for tests.',
      module: 'MATH101',
      topic: 'Calculus',
      createdBy: 'user2',
      createdByName: 'Jane Smith',
      members: ['user2', 'user1'],
      memberCount: 2,
      maxMembers: 5,
      isPublic: true,
      tags: ['calculus', 'mathematics', 'problem-solving'],
      location: {
        type: 'online',
        details: 'Microsoft Teams Meeting'
      },
      schedule: {
        frequency: 'weekly',
        dayOfWeek: 'wednesday',
        time: '16:00',
        duration: 90,
        nextSession: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))
      },
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  groupMessages: [
    {
      id: 'msg1',
      groupId: 'group1',
      senderId: 'user1',
      senderName: 'John Doe',
      message: 'Hey everyone! Looking forward to our study session tomorrow. I\'ve prepared some practice problems on sorting algorithms.',
      messageType: 'text',
      attachments: [],
      replyTo: null,
      edited: false,
      editedAt: null,
      reactions: {
        '👍': ['user2', 'user3'],
        '🔥': ['user2']
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'msg2',
      groupId: 'group1',
      senderId: 'user2',
      senderName: 'Jane Smith',
      message: 'Great! I\'ve been working on the merge sort implementation. Can we go through it together?',
      messageType: 'text',
      attachments: [],
      replyTo: 'msg1',
      edited: false,
      editedAt: null,
      reactions: {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  studySessions: [
    {
      id: 'session1',
      userId: 'user1',
      groupId: 'group1',
      module: 'COMS3011',
      topic: 'Sorting Algorithms',
      sessionType: 'group',
      duration: 120,
      startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
      endTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 120 * 60 * 1000)),
      location: {
        type: 'campus',
        details: 'Library Study Room 3A'
      },
      participants: ['user1', 'user2', 'user3'],
      activities: [
        {
          activity: 'problem_solving',
          duration: 60,
          description: 'Worked through sorting algorithm problems'
        },
        {
          activity: 'discussion',
          duration: 40,
          description: 'Discussed time complexity analysis'
        },
        {
          activity: 'review',
          duration: 20,
          description: 'Reviewed key concepts'
        }
      ],
      notes: 'Great session! Everyone understood the merge sort implementation. Need to focus more on quick sort next time.',
      rating: 5,
      completed: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'session2',
      userId: 'user2',
      groupId: null,
      module: 'MATH101',
      topic: 'Derivatives',
      sessionType: 'individual',
      duration: 90,
      startTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
      endTime: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000)),
      location: {
        type: 'home',
        details: 'Home study room'
      },
      participants: ['user2'],
      activities: [
        {
          activity: 'reading',
          duration: 30,
          description: 'Read textbook chapter on derivatives'
        },
        {
          activity: 'problem_solving',
          duration: 45,
          description: 'Solved practice problems'
        },
        {
          activity: 'note_taking',
          duration: 15,
          description: 'Created summary notes'
        }
      ],
      notes: 'Made good progress on understanding the chain rule. Need to practice more with trigonometric functions.',
      rating: 4,
      completed: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  progressTracking: [
    {
      id: 'progress1',
      userId: 'user1',
      module: 'COMS3011',
      topic: 'Sorting Algorithms',
      status: 'completed',
      completionPercentage: 100,
      studyHours: 8.5,
      lastStudied: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
      difficulty: 3,
      confidence: 4,
      notes: 'Mastered bubble sort, selection sort, and merge sort. Quick sort still needs work.',
      resources: [
        {
          type: 'textbook',
          title: 'Introduction to Algorithms',
          url: 'https://example.com/textbook',
          completed: true
        },
        {
          type: 'video',
          title: 'Sorting Algorithms Explained',
          url: 'https://example.com/video',
          completed: true
        },
        {
          type: 'practice_problems',
          title: 'LeetCode Sorting Problems',
          url: 'https://leetcode.com/problemset/all/',
          completed: false
        }
      ],
      milestones: [
        {
          title: 'Understand Basic Sorting',
          description: 'Learn bubble sort and selection sort',
          completed: true,
          completedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000))
        },
        {
          title: 'Master Merge Sort',
          description: 'Implement and understand merge sort',
          completed: true,
          completedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
        },
        {
          title: 'Quick Sort Implementation',
          description: 'Implement and understand quick sort',
          completed: false,
          completedAt: null
        }
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  notifications: [
    {
      id: 'notif1',
      userId: 'user1',
      senderId: 'system',
      senderName: 'System',
      title: 'Study Session Reminder',
      body: 'Your COMS3011 study group session starts in 30 minutes!',
      type: 'session_reminder',
      data: {
        groupId: 'group1',
        sessionTime: '14:00'
      },
      read: false,
      readAt: null,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      fcmMessageId: 'fcm_msg_1',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
      id: 'notif2',
      userId: 'user2',
      senderId: 'user1',
      senderName: 'John Doe',
      title: 'New Group Invitation',
      body: 'You have been invited to join the MATH101 Study Group',
      type: 'group_invite',
      data: {
        groupId: 'group2',
        groupName: 'MATH101 Study Group'
      },
      read: true,
      readAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)),
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      fcmMessageId: 'fcm_msg_2',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }
  ],

  courseworkFiles: [
    {
      id: 'file1',
      fileName: 'COMS3011_Assignment1.pdf',
      storagePath: 'coursework/user1/assignment1.pdf',
      downloadUrl: 'https://storage.googleapis.com/sd2025law.appspot.com/coursework/user1/assignment1.pdf',
      uploadedBy: 'user1',
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      fileSize: 2048576,
      mimeType: 'application/pdf',
      isPublic: false,
      tags: ['assignment', 'algorithms'],
      description: 'First assignment for COMS3011 - Sorting Algorithms',
      courseCode: 'COMS3011',
      topic: 'Sorting Algorithms',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      downloadCount: 3,
      lastDownloadedAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
    }
  ],

  bugs: [
    {
      id: 'bug1',
      title: 'Weather widget not updating in real-time',
      description: 'The weather widget on the dashboard shows cached data and doesn\'t refresh automatically. Users have to manually refresh the page to see updated weather information.',
      severity: 'medium',
      category: 'ui',
      status: 'open',
      priority: 5,
      reporterId: 'user1',
      reporterName: 'John Doe',
      reporterEmail: 'john.doe@students.wits.ac.za',
      assignedTo: null,
      assignedToName: null,
      stepsToReproduce: '1. Open the dashboard\n2. Wait for 5+ minutes\n3. Check if weather data updates\n4. Notice it still shows old data',
      expectedBehavior: 'Weather data should update automatically every 5 minutes',
      actualBehavior: 'Weather data remains static until page refresh',
      environment: {
        browser: 'Chrome 120',
        os: 'Windows 11',
        device: 'Desktop',
        version: '1.0.0',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      attachments: [],
      comments: [],
      tags: ['weather', 'dashboard', 'real-time'],
      votes: 2,
      voters: ['user1', 'user2'],
      watchers: ['user1', 'user2', 'user3'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      resolvedAt: null
    }
  ]
};

/**
 * Seed the database with sample data
 */
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional - be careful in production!)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧹 Clearing existing test data...');
      await clearTestData();
    }

    // Seed users
    console.log('👥 Seeding users...');
    for (const user of sampleData.users) {
      await db.collection('users').doc(user.uid).set(user);
    }

    // Seed study groups
    console.log('👥 Seeding study groups...');
    for (const group of sampleData.studyGroups) {
      await db.collection('study_groups').doc(group.id).set(group);
    }

    // Seed group messages
    console.log('💬 Seeding group messages...');
    for (const message of sampleData.groupMessages) {
      await db.collection('group_messages').doc(message.id).set(message);
    }

    // Seed study sessions
    console.log('📚 Seeding study sessions...');
    for (const session of sampleData.studySessions) {
      await db.collection('study_sessions').doc(session.id).set(session);
    }

    // Seed progress tracking
    console.log('📊 Seeding progress tracking...');
    for (const progress of sampleData.progressTracking) {
      await db.collection('progress_tracking').doc(progress.id).set(progress);
    }

    // Seed notifications
    console.log('🔔 Seeding notifications...');
    for (const notification of sampleData.notifications) {
      await db.collection('notifications').doc(notification.id).set(notification);
    }

    // Seed coursework files
    console.log('📁 Seeding coursework files...');
    for (const file of sampleData.courseworkFiles) {
      await db.collection('coursework_files').doc(file.id).set(file);
    }

    // Seed bugs
    console.log('🐛 Seeding bug reports...');
    for (const bug of sampleData.bugs) {
      await db.collection('bugs').doc(bug.id).set(bug);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${sampleData.users.length} users`);
    console.log(`📊 Seeded ${sampleData.studyGroups.length} study groups`);
    console.log(`📊 Seeded ${sampleData.groupMessages.length} group messages`);
    console.log(`📊 Seeded ${sampleData.studySessions.length} study sessions`);
    console.log(`📊 Seeded ${sampleData.progressTracking.length} progress records`);
    console.log(`📊 Seeded ${sampleData.notifications.length} notifications`);
    console.log(`📊 Seeded ${sampleData.courseworkFiles.length} coursework files`);
    console.log(`📊 Seeded ${sampleData.bugs.length} bug reports`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

/**
 * Clear test data from the database
 */
async function clearTestData() {
  const collections = [
    'users',
    'study_groups',
    'group_messages',
    'study_sessions',
    'progress_tracking',
    'notifications',
    'coursework_files',
    'bugs',
    'bug_activities',
    'scheduled_notifications',
    'user_feedback'
  ];

  for (const collectionName of collections) {
    try {
      const snapshot = await db.collection(collectionName).get();
      const batch = db.batch();
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`🧹 Cleared ${snapshot.docs.length} documents from ${collectionName}`);
    } catch (error) {
      console.error(`❌ Error clearing ${collectionName}:`, error.message);
    }
  }
}

/**
 * Verify seeded data
 */
async function verifySeededData() {
  try {
    console.log('🔍 Verifying seeded data...');

    const collections = [
      'users',
      'study_groups',
      'group_messages',
      'study_sessions',
      'progress_tracking',
      'notifications',
      'coursework_files',
      'bugs'
    ];

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      console.log(`✅ ${collectionName}: ${snapshot.docs.length} documents`);
    }

  } catch (error) {
    console.error('❌ Error verifying seeded data:', error);
  }
}

// Run the seeding script
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => verifySeededData())
    .then(() => {
      console.log('🎉 Database seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Database seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase, clearTestData, verifySeededData, sampleData };
