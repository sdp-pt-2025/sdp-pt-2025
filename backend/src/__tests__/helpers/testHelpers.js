import { jest } from "@jest/globals";
import admin from "firebase-admin";

/**
 * Test data factories for creating consistent test data
 */
export const TestDataFactory = {
    createUser: (overrides = {}) => ({
        id: "test-user-id",
        uid: "test-user-uid",
        email: "test@example.com",
        displayName: "Test User",
        photoURL: "https://example.com/photo.jpg",
        university: "University of the Witwatersrand",
        studentId: "12345678",
        yearOfStudy: 3,
        faculty: "Engineering",
        modules: ["COMS3011", "COMS3028"],
        fcmToken: "test-fcm-token",
        isActive: true,
        lastLoginAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        studyPreferences: {
            studyStyle: "group",
            preferredTime: "evening",
            location: "library"
        },
        availability: {
            monday: ["14:00", "16:00"],
            tuesday: ["10:00", "12:00"],
            wednesday: ["14:00", "16:00"]
        },
        ...overrides
    }),

    createStudyGroup: (overrides = {}) => ({
        id: "test-group-id",
        name: "Test Study Group",
        description: "A test study group for COMS3011",
        module: "COMS3011",
        topic: "Design Patterns",
        createdBy: "test-user-uid",
        createdByName: "Test User",
        memberCount: 1,
        maxMembers: 8,
        isPublic: true,
        tags: ["design-patterns", "software-engineering"],
        status: "active",
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
            type: "physical",
            name: "Library Study Room 3",
            address: "Wits University Library"
        },
        schedule: {
            frequency: "weekly",
            days: ["monday", "wednesday"],
            time: "14:00-16:00"
        },
        ...overrides
    }),

    createProgressEntry: (overrides = {}) => ({
        id: "test-progress-id",
        userId: "test-user-uid",
        module: "COMS3011",
        topic: "Design Patterns",
        status: "in_progress",
        completionPercentage: 60,
        studyHours: 4.5,
        lastStudied: new Date(),
        difficulty: 3,
        confidence: 4,
        notes: "Completed Singleton and Factory patterns",
        createdAt: new Date(),
        updatedAt: new Date(),
        resources: [
            {
                type: "book",
                title: "Design Patterns: Elements of Reusable Object-Oriented Software",
                url: "https://example.com/book"
            }
        ],
        milestones: [
            {
                title: "Understand Singleton Pattern",
                completed: true,
                completedAt: new Date()
            },
            {
                title: "Implement Factory Pattern",
                completed: false,
                completedAt: null
            }
        ],
        ...overrides
    }),

    createNotification: (overrides = {}) => ({
        id: "test-notification-id",
        userId: "test-user-uid",
        senderId: "other-user-uid",
        senderName: "Other User",
        title: "Study Group Invitation",
        body: "You've been invited to join the COMS3011 Study Group",
        type: "group_invite",
        data: {
            groupId: "test-group-id",
            groupName: "COMS3011 Study Group"
        },
        read: false,
        readAt: null,
        sentAt: new Date(),
        createdAt: new Date(),
        fcmMessageId: "test-fcm-message-id",
        ...overrides
    }),

    createStudySession: (overrides = {}) => ({
        id: "test-session-id",
        userId: "test-user-uid",
        groupId: "test-group-id",
        module: "COMS3011",
        topic: "Design Patterns",
        sessionType: "group",
        duration: 120,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
        completed: false,
        rating: null,
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        location: {
            type: "physical",
            name: "Library Study Room 3"
        },
        activities: [
            "Group discussion",
            "Problem solving",
            "Peer teaching"
        ],
        ...overrides
    }),

    createChatMessage: (overrides = {}) => ({
        id: "test-message-id",
        chatId: "test-chat-id",
        senderId: "test-user-uid",
        content: "Hello everyone! Ready for our study session?",
        messageType: "text",
        attachments: null,
        replyToId: null,
        isRead: false,
        readAt: null,
        edited: false,
        editedAt: null,
        reactions: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    }),

    createFile: (overrides = {}) => ({
        id: "test-file-id",
        fileName: "study-notes.pdf",
        storagePath: "coursework/test-user-uid/test-file.pdf",
        downloadUrl: "https://storage.googleapis.com/bucket/path",
        uploadedBy: "test-user-uid",
        fileSize: 1024000,
        mimeType: "application/pdf",
        isPublic: true,
        tags: ["notes", "study"],
        description: "Study notes for design patterns",
        courseCode: "COMS3011",
        topic: "Design Patterns",
        downloadCount: 0,
        lastDownloadedAt: null,
        uploadedAt: new Date(),
        updatedAt: new Date(),
        ...overrides
    })
};

/**
 * Mock Firebase Admin SDK functions
 */
export const MockFirebaseAdmin = {
    setupFirestoreMocks: () => {
        const mockDoc = {
            exists: true,
            data: () => ({}),
            id: "test-doc-id"
        };

        const mockCollection = {
            doc: jest.fn(() => ({
                get: jest.fn().mockResolvedValue(mockDoc),
                set: jest.fn().mockResolvedValue(),
                update: jest.fn().mockResolvedValue(),
                delete: jest.fn().mockResolvedValue()
            })),
            add: jest.fn().mockResolvedValue({ id: "test-doc-id" }),
            where: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                    docs: [],
                    empty: true
                }),
                orderBy: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue({
                        docs: [],
                        empty: true
                    }),
                    limit: jest.fn(() => ({
                        get: jest.fn().mockResolvedValue({
                            docs: [],
                            empty: true
                        }),
                        offset: jest.fn(() => ({
                            get: jest.fn().mockResolvedValue({
                                docs: [],
                                empty: true
                            })
                        }))
                    }))
                }))
            })),
            orderBy: jest.fn(() => ({
                get: jest.fn().mockResolvedValue({
                    docs: [],
                    empty: true
                }),
                limit: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue({
                        docs: [],
                        empty: true
                    })
                }))
            }))
        };

        admin.firestore = jest.fn(() => ({
            collection: jest.fn(() => mockCollection)
        }));

        return { mockDoc, mockCollection };
    },

    setupStorageMocks: () => {
        const mockFile = {
            createWriteStream: jest.fn(() => ({
                on: jest.fn(),
                end: jest.fn()
            })),
            delete: jest.fn().mockResolvedValue(),
            makePublic: jest.fn().mockResolvedValue()
        };

        const mockBucket = {
            file: jest.fn(() => mockFile)
        };

        admin.storage = jest.fn(() => ({
            bucket: jest.fn(() => mockBucket)
        }));

        return { mockFile, mockBucket };
    },

    setupAuthMocks: () => {
        admin.auth = jest.fn(() => ({
            listUsers: jest.fn().mockResolvedValue({
                users: []
            }),
            verifyIdToken: jest.fn().mockResolvedValue({
                uid: "test-user-uid",
                email: "test@example.com"
            })
        }));

        return admin.auth();
    },

    setupMessagingMocks: () => {
        admin.messaging = jest.fn(() => ({
            send: jest.fn().mockResolvedValue("test-message-id"),
            sendMulticast: jest.fn().mockResolvedValue({
                successCount: 1,
                failureCount: 0
            })
        }));

        return admin.messaging();
    }
};

/**
 * Authentication helpers
 */
export const AuthHelpers = {
    createMockUser: (overrides = {}) => ({
        uid: "test-user-uid",
        email: "test@example.com",
        name: "Test User",
        ...overrides
    }),

    createMockToken: () => "mock-firebase-token",

    setupAuthMiddleware: (user = AuthHelpers.createMockUser()) => {
        jest.doMock("../../middleware/auth.js", () => ({
            verifyToken: (req, res, next) => {
                req.user = user;
                next();
            }
        }));
    },

    setupUnauthenticatedMiddleware: () => {
        jest.doMock("../../middleware/auth.js", () => ({
            verifyToken: (req, res, next) => {
                res.status(401).json({
                    success: false,
                    error: "Authentication required",
                    message: "Valid Firebase ID token required"
                });
            }
        }));
    }
};

/**
 * Database helpers
 */
export const DatabaseHelpers = {
    mockFirestoreQuery: (data = []) => {
        const mockDocs = data.map(item => ({
            id: item.id || "test-id",
            data: () => item,
            exists: true
        }));

        return {
            docs: mockDocs,
            empty: mockDocs.length === 0,
            size: mockDocs.length
        };
    },

    mockFirestoreDoc: (data = {}) => ({
        id: data.id || "test-doc-id",
        data: () => data,
        exists: true
    }),

    mockFirestoreCollection: (docs = []) => ({
        doc: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(DatabaseHelpers.mockFirestoreDoc()),
            set: jest.fn().mockResolvedValue(),
            update: jest.fn().mockResolvedValue(),
            delete: jest.fn().mockResolvedValue()
        })),
        add: jest.fn().mockResolvedValue({ id: "test-doc-id" }),
        where: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(DatabaseHelpers.mockFirestoreQuery(docs)),
            orderBy: jest.fn(() => ({
                get: jest.fn().mockResolvedValue(DatabaseHelpers.mockFirestoreQuery(docs)),
                limit: jest.fn(() => ({
                    get: jest.fn().mockResolvedValue(DatabaseHelpers.mockFirestoreQuery(docs)),
                    offset: jest.fn(() => ({
                        get: jest.fn().mockResolvedValue(DatabaseHelpers.mockFirestoreQuery(docs))
                    }))
                }))
            }))
        }))
    })
};

/**
 * Request helpers
 */
export const RequestHelpers = {
    createMockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        user: AuthHelpers.createMockUser(),
        file: null,
        ...overrides
    }),

    createMockResponse: () => {
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
            redirect: jest.fn().mockReturnThis()
        };
        return res;
    },

    createMockNext: () => jest.fn()
};

/**
 * Test utilities
 */
export const TestUtils = {
    waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

    generateRandomId: () => Math.random().toString(36).substr(2, 9),

    createDateInFuture: (hours = 1) => new Date(Date.now() + hours * 60 * 60 * 1000),

    createDateInPast: (hours = 1) => new Date(Date.now() - hours * 60 * 60 * 1000),

    expectErrorResponse: (response, statusCode, errorType) => {
        expect(response.status).toBe(statusCode);
        expect(response.body).toHaveProperty("success", false);
        expect(response.body).toHaveProperty("error", errorType);
        expect(response.body).toHaveProperty("message");
    },

    expectSuccessResponse: (response, statusCode = 200) => {
        expect(response.status).toBe(statusCode);
        expect(response.body).toHaveProperty("success", true);
    }
};

/**
 * Environment setup
 */
export const TestEnvironment = {
    setup: () => {
        process.env.NODE_ENV = "test";
        process.env.FIREBASE_PROJECT_ID = "test-project";
        process.env.OPENWEATHER_API_KEY = "test-api-key";
        process.env.MAX_FILE_SIZE = "10485760";
        process.env.ALLOWED_FILE_TYPES = "application/pdf";
        process.env.RATE_LIMIT_WINDOW_MS = "900000";
        process.env.RATE_LIMIT_MAX_REQUESTS = "100";
        process.env.DATABASE_URL = "file:./test.db";
    },

    cleanup: () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    }
};

export default {
    TestDataFactory,
    MockFirebaseAdmin,
    AuthHelpers,
    DatabaseHelpers,
    RequestHelpers,
    TestUtils,
    TestEnvironment
};
