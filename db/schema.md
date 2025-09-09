# Campus Study Buddy - Database Schema

## Overview
This document describes the Firebase Firestore database schema for the Campus Study Buddy platform. The database is organized into collections that support all core features including user management, study groups, progress tracking, notifications, and file management.

## Collections

### 1. users
Stores user profiles and preferences.

```javascript
{
  uid: string,                    // Firebase Auth UID (document ID)
  email: string,                  // User's email address
  displayName: string,            // User's display name
  photoURL: string,               // Profile picture URL
  university: string,             // University name (e.g., "University of the Witwatersrand")
  studentId: string,              // Student ID number
  yearOfStudy: number,            // Current year of study (1-4)
  faculty: string,                // Faculty/Department
  modules: string[],              // Array of module codes (e.g., ["COMS3011", "MATH101"])
  studyPreferences: {
    preferredStudyTimes: string[], // ["morning", "afternoon", "evening"]
    studyStyle: string,           // "individual", "group", "both"
    locationPreference: string,   // "indoor", "outdoor", "both"
    maxGroupSize: number,         // Maximum preferred group size
    subjects: string[]            // Subjects of interest
  },
  availability: {
    monday: { start: string, end: string, available: boolean },
    tuesday: { start: string, end: string, available: boolean },
    wednesday: { start: string, end: string, available: boolean },
    thursday: { start: string, end: string, available: boolean },
    friday: { start: string, end: string, available: boolean },
    saturday: { start: string, end: string, available: boolean },
    sunday: { start: string, end: string, available: boolean }
  },
  fcmToken: string,               // Firebase Cloud Messaging token
  tokenUpdatedAt: timestamp,      // When FCM token was last updated
  createdAt: timestamp,           // Account creation date
  updatedAt: timestamp,           // Last profile update
  isActive: boolean,              // Account status
  lastLoginAt: timestamp          // Last login timestamp
}
```

### 2. study_groups
Stores study group information and membership.

```javascript
{
  id: string,                     // Auto-generated document ID
  name: string,                   // Group name
  description: string,            // Group description
  module: string,                 // Module code (e.g., "COMS3011")
  topic: string,                  // Specific topic being studied
  createdBy: string,              // User UID of creator
  createdByName: string,          // Creator's display name
  members: string[],              // Array of member UIDs
  memberCount: number,            // Current number of members
  maxMembers: number,             // Maximum allowed members
  isPublic: boolean,              // Whether group is publicly discoverable
  tags: string[],                 // Search tags
  location: {
    type: string,                 // "online", "campus", "specific"
    details: string,              // Specific location details
    coordinates: {                // For campus locations
      lat: number,
      lng: number
    }
  },
  schedule: {
    frequency: string,            // "weekly", "biweekly", "monthly", "custom"
    dayOfWeek: string,            // "monday", "tuesday", etc.
    time: string,                 // Time in HH:MM format
    duration: number,             // Duration in minutes
    nextSession: timestamp        // Next scheduled session
  },
  status: string,                 // "active", "inactive", "completed", "cancelled"
  createdAt: timestamp,           // Group creation date
  updatedAt: timestamp,           // Last update date
  lastActivityAt: timestamp       // Last message or activity
}
```

### 3. group_messages
Stores chat messages within study groups.

```javascript
{
  id: string,                     // Auto-generated document ID
  groupId: string,                // Reference to study_groups document
  senderId: string,               // User UID of sender
  senderName: string,             // Sender's display name
  message: string,                // Message content
  messageType: string,            // "text", "file", "image", "system"
  attachments: [                  // File attachments
    {
      fileName: string,
      fileUrl: string,
      fileType: string,
      fileSize: number
    }
  ],
  replyTo: string,                // Message ID being replied to (optional)
  edited: boolean,                // Whether message was edited
  editedAt: timestamp,            // Edit timestamp
  reactions: {                    // Message reactions
    [emoji: string]: string[]     // emoji -> array of user UIDs
  },
  createdAt: timestamp,           // Message timestamp
  updatedAt: timestamp            // Last update timestamp
}
```

### 4. study_sessions
Stores individual study session records.

```javascript
{
  id: string,                     // Auto-generated document ID
  userId: string,                 // User UID
  groupId: string,                // Associated study group (optional)
  module: string,                 // Module code
  topic: string,                  // Specific topic studied
  sessionType: string,            // "individual", "group", "tutoring"
  duration: number,               // Duration in minutes
  startTime: timestamp,           // Session start time
  endTime: timestamp,             // Session end time
  location: {
    type: string,                 // "home", "library", "campus", "online"
    details: string               // Specific location
  },
  participants: string[],         // Array of participant UIDs (for group sessions)
  activities: [                   // Activities performed during session
    {
      activity: string,           // "reading", "problem_solving", "discussion", etc.
      duration: number,           // Duration in minutes
      description: string         // Additional details
    }
  ],
  notes: string,                  // Session notes
  rating: number,                 // Session rating (1-5)
  completed: boolean,             // Whether session was completed
  createdAt: timestamp,           // Record creation time
  updatedAt: timestamp            // Last update time
}
```

### 5. progress_tracking
Stores user progress on modules and topics.

```javascript
{
  id: string,                     // Auto-generated document ID
  userId: string,                 // User UID
  module: string,                 // Module code
  topic: string,                  // Specific topic
  status: string,                 // "not_started", "in_progress", "completed", "review"
  completionPercentage: number,   // 0-100
  studyHours: number,             // Total hours spent on this topic
  lastStudied: timestamp,         // Last study session timestamp
  difficulty: number,             // User-rated difficulty (1-5)
  confidence: number,             // User confidence level (1-5)
  notes: string,                  // Personal notes about the topic
  resources: [                    // Study resources used
    {
      type: string,               // "textbook", "video", "practice_problems", etc.
      title: string,
      url: string,                // Resource URL or reference
      completed: boolean
    }
  ],
  milestones: [                   // Learning milestones
    {
      title: string,
      description: string,
      completed: boolean,
      completedAt: timestamp
    }
  ],
  createdAt: timestamp,           // Record creation time
  updatedAt: timestamp            // Last update time
}
```

### 6. notifications
Stores user notifications and messages.

```javascript
{
  id: string,                     // Auto-generated document ID
  userId: string,                 // Recipient UID
  senderId: string,               // Sender UID (optional)
  senderName: string,             // Sender's display name
  title: string,                  // Notification title
  body: string,                   // Notification message
  type: string,                   // "study_reminder", "group_invite", "session_reminder", "general"
  data: object,                   // Additional data payload
  read: boolean,                  // Read status
  readAt: timestamp,              // Read timestamp
  sentAt: timestamp,              // Sent timestamp
  fcmMessageId: string,           // Firebase Cloud Messaging message ID
  createdAt: timestamp            // Record creation time
}
```

### 7. scheduled_notifications
Stores scheduled notifications and reminders.

```javascript
{
  id: string,                     // Auto-generated document ID
  userId: string,                 // User UID
  title: string,                  // Notification title
  body: string,                   // Notification message
  scheduledTime: timestamp,       // When to send the notification
  data: object,                   // Additional data payload
  status: string,                 // "scheduled", "sent", "failed", "cancelled"
  sentAt: timestamp,              // Actual send time (if sent)
  error: string,                  // Error message (if failed)
  createdAt: timestamp,           // Record creation time
  updatedAt: timestamp            // Last update time
}
```

### 8. coursework_files
Stores metadata for uploaded PDF files.

```javascript
{
  id: string,                     // Auto-generated document ID
  fileName: string,               // Original filename
  storagePath: string,            // Firebase Storage path
  downloadUrl: string,            // Public download URL
  uploadedBy: string,             // User UID who uploaded
  uploadedAt: timestamp,          // Upload timestamp
  fileSize: number,               // File size in bytes
  mimeType: string,               // MIME type (application/pdf)
  isPublic: boolean,              // Whether file is publicly accessible
  tags: string[],                 // Search tags
  description: string,            // File description
  courseCode: string,             // Associated course code
  topic: string,                  // Associated topic
  updatedAt: timestamp,           // Last update time
  downloadCount: number,          // Number of downloads
  lastDownloadedAt: timestamp     // Last download timestamp
}
```

### 9. bugs
Stores bug reports and issue tracking.

```javascript
{
  id: string,                     // Auto-generated document ID
  title: string,                  // Bug title
  description: string,            // Detailed description
  severity: string,               // "low", "medium", "high", "critical"
  category: string,               // "ui", "api", "performance", "security", "data", "other"
  status: string,                 // "open", "in_progress", "resolved", "closed", "duplicate"
  priority: number,               // Calculated priority score
  reporterId: string,             // User UID who reported
  reporterName: string,           // Reporter's display name
  reporterEmail: string,          // Reporter's email
  assignedTo: string,             // Assigned user UID (optional)
  assignedToName: string,         // Assigned user's name
  stepsToReproduce: string,       // Steps to reproduce the bug
  expectedBehavior: string,       // Expected behavior
  actualBehavior: string,         // Actual behavior
  environment: {                  // Environment details
    browser: string,
    os: string,
    device: string,
    version: string,
    userAgent: string
  },
  attachments: string[],          // Array of attachment URLs
  comments: [                     // Bug comments
    {
      id: string,
      userId: string,
      userName: string,
      userEmail: string,
      comment: string,
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ],
  tags: string[],                 // Bug tags
  votes: number,                  // Number of votes
  voters: string[],               // Array of user UIDs who voted
  watchers: string[],             // Array of user UIDs watching this bug
  createdAt: timestamp,           // Report creation time
  updatedAt: timestamp,           // Last update time
  resolvedAt: timestamp           // Resolution time (if resolved)
}
```

### 10. bug_activities
Stores activity log for bug reports.

```javascript
{
  id: string,                     // Auto-generated document ID
  bugId: string,                  // Reference to bugs document
  action: string,                 // "created", "updated", "commented", "assigned", "resolved"
  userId: string,                 // User UID who performed action
  userName: string,               // User's display name
  timestamp: timestamp,           // Action timestamp
  details: object                 // Action-specific details
}
```

### 11. user_feedback
Stores user feedback and suggestions.

```javascript
{
  id: string,                     // Auto-generated document ID
  userId: string,                 // User UID
  userName: string,               // User's display name
  userEmail: string,              // User's email
  type: string,                   // "feature_request", "bug_report", "general_feedback"
  category: string,               // Feature category
  title: string,                  // Feedback title
  description: string,            // Detailed feedback
  rating: number,                 // Overall rating (1-5)
  priority: string,               // "low", "medium", "high"
  status: string,                 // "submitted", "under_review", "in_progress", "completed", "rejected"
  assignedTo: string,             // Assigned team member UID
  tags: string[],                 // Feedback tags
  votes: number,                  // Number of votes
  voters: string[],               // Array of user UIDs who voted
  createdAt: timestamp,           // Submission time
  updatedAt: timestamp,           // Last update time
  reviewedAt: timestamp,          // Review time
  completedAt: timestamp          // Completion time
}
```

## Indexes

### Required Firestore Indexes

The following composite indexes are required for optimal query performance:

1. **study_groups collection:**
   - `status` (Ascending) + `createdAt` (Descending)
   - `module` (Ascending) + `status` (Ascending) + `createdAt` (Descending)
   - `isPublic` (Ascending) + `status` (Ascending) + `createdAt` (Descending)

2. **group_messages collection:**
   - `groupId` (Ascending) + `createdAt` (Descending)

3. **study_sessions collection:**
   - `userId` (Ascending) + `startTime` (Descending)
   - `groupId` (Ascending) + `startTime` (Descending)
   - `module` (Ascending) + `startTime` (Descending)

4. **progress_tracking collection:**
   - `userId` (Ascending) + `module` (Ascending) + `updatedAt` (Descending)
   - `userId` (Ascending) + `status` (Ascending) + `updatedAt` (Descending)

5. **notifications collection:**
   - `userId` (Ascending) + `sentAt` (Descending)
   - `userId` (Ascending) + `read` (Ascending) + `sentAt` (Descending)

6. **coursework_files collection:**
   - `uploadedBy` (Ascending) + `uploadedAt` (Descending)
   - `uploadedBy` (Ascending) + `courseCode` (Ascending) + `uploadedAt` (Descending)

7. **bugs collection:**
   - `status` (Ascending) + `createdAt` (Descending)
   - `severity` (Ascending) + `status` (Ascending) + `createdAt` (Descending)
   - `category` (Ascending) + `status` (Ascending) + `createdAt` (Descending)
   - `assignedTo` (Ascending) + `status` (Ascending) + `createdAt` (Descending)

8. **bug_activities collection:**
   - `bugId` (Ascending) + `timestamp` (Descending)

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Study groups - members can read, creators can write
    match /study_groups/{groupId} {
      allow read: if request.auth != null && 
        (resource.data.members.hasAny([request.auth.uid]) || 
         resource.data.isPublic == true);
      allow create: if request.auth != null && 
        request.auth.uid == resource.data.createdBy;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.createdBy || 
         resource.data.members.hasAny([request.auth.uid]));
    }
    
    // Group messages - group members can read/write
    match /group_messages/{messageId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/study_groups/$(resource.data.groupId)) &&
        get(/databases/$(database)/documents/study_groups/$(resource.data.groupId)).data.members.hasAny([request.auth.uid]);
    }
    
    // Study sessions - users can read/write their own sessions
    match /study_sessions/{sessionId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         resource.data.participants.hasAny([request.auth.uid]));
    }
    
    // Progress tracking - users can read/write their own progress
    match /progress_tracking/{progressId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Notifications - users can read their own notifications
    match /notifications/{notificationId} {
      allow read, update: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Coursework files - users can read/write their own files
    match /coursework_files/{fileId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.uploadedBy;
    }
    
    // Bug reports - authenticated users can read/write
    match /bugs/{bugId} {
      allow read, write: if request.auth != null;
    }
    
    // Bug activities - authenticated users can read, bug participants can write
    match /bug_activities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/bugs/$(resource.data.bugId));
    }
    
    // User feedback - authenticated users can read/write
    match /user_feedback/{feedbackId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Coursework files - users can upload/read their own files
    match /coursework/{userId}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public files (if any)
    match /public/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Data Migration and Backup

### Backup Strategy
- Daily automated backups of Firestore database
- Weekly exports to Cloud Storage
- Monthly full database exports for long-term storage

### Migration Considerations
- Use Firestore batch operations for bulk data updates
- Implement data validation before migration
- Test migrations on staging environment first
- Maintain backward compatibility during schema changes

## Performance Optimization

### Query Optimization
- Use composite indexes for complex queries
- Implement pagination for large result sets
- Cache frequently accessed data
- Use Firestore offline persistence for mobile apps

### Data Structure Optimization
- Denormalize data where appropriate to reduce reads
- Use subcollections for hierarchical data
- Implement data archiving for old records
- Use batch operations for bulk updates

## Monitoring and Analytics

### Key Metrics to Track
- User engagement and activity
- Study group formation and participation
- File upload/download patterns
- Bug report trends and resolution times
- API performance and error rates

### Monitoring Tools
- Firebase Analytics for user behavior
- Cloud Monitoring for system performance
- Custom dashboards for business metrics
- Error tracking and alerting systems
