import { jest } from "@jest/globals";

/**
 * Test Data Factory - Creates consistent test data for all test scenarios
 */
export const TestDataFactory = {
    /**
     * Create a test user with default values
     */
    createUser: (overrides = {}) => ({
        id: "test-user-id",
        uid: "test-user-uid",
        email: "test@example.com",
        name: "Test User",
        modules: ["COMS3011", "COMS3028"],
        year: 3,
        major: "Computer Science",
        studyPreferences: ["group", "library"],
        availability: ["Monday", "Wednesday", "Friday"],
        rating: 4.5,
        totalStudyHours: 100,
        fcmToken: "test-fcm-token-123",
        createdAt: new Date().toISOString(),
        ...overrides,
    }),

    /**
     * Create a test study group with default values
     */
    createStudyGroup: (overrides = {}) => ({
        id: "test-group-id",
        name: "Test Study Group",
        description: "A test study group for testing purposes",
        module: "COMS3011",
        maxMembers: 8,
        currentMembers: 1,
        members: [
            {
                id: "test-user-uid",
                name: "Test User",
                role: "admin",
            },
        ],
        schedule: ["Monday 2-4pm", "Wednesday 3-5pm"],
        location: "Library Study Room 3",
        createdAt: new Date().toISOString(),
        createdBy: "test-user-uid",
        ...overrides,
    }),

    /**
     * Create a test progress entry with default values
     */
    createProgressEntry: (overrides = {}) => ({
        id: "test-progress-id",
        userId: "test-user-uid",
        topic: "Test Topic",
        module: "COMS3011",
        hours: 2.5,
        notes: "Test study session notes",
        completed: false,
        date: new Date().toISOString(),
        ...overrides,
    }),

    /**
     * Create a test notification with default values
     */
    createNotification: (overrides = {}) => ({
        id: "test-notification-id",
        userId: "test-user-uid",
        senderId: "test-sender-uid",
        title: "Test Notification",
        body: "This is a test notification",
        type: "general",
        data: {},
        sentAt: new Date().toISOString(),
        read: false,
        fcmMessageId: "test-message-id",
        ...overrides,
    }),

    /**
     * Create a test group message with default values
     */
    createGroupMessage: (overrides = {}) => ({
        id: "test-message-id",
        groupId: "test-group-id",
        userId: "test-user-uid",
        userName: "Test User",
        message: "Test group message",
        timestamp: new Date().toISOString(),
        ...overrides,
    }),

    /**
     * Create multiple test users for bulk operations
     */
    createMultipleUsers: (count = 3) => {
        return Array.from({ length: count }, (_, index) =>
            TestDataFactory.createUser({
                id: `test-user-${index + 1}`,
                uid: `test-user-uid-${index + 1}`,
                email: `test${index + 1}@example.com`,
                name: `Test User ${index + 1}`,
            })
        );
    },

    /**
     * Create multiple test notifications for bulk operations
     */
    createMultipleNotifications: (count = 3, userId = "test-user-uid") => {
        return Array.from({ length: count }, (_, index) =>
            TestDataFactory.createNotification({
                id: `test-notification-${index + 1}`,
                userId,
                title: `Test Notification ${index + 1}`,
                body: `This is test notification ${index + 1}`,
            })
        );
    },
};

/**
 * Authentication Helpers - Mock authentication and user context
 */
export const AuthHelpers = {
    /**
     * Create a mock request object with authenticated user
     */
    createAuthenticatedRequest: (user = TestDataFactory.createUser()) => ({
        user,
        headers: {
            authorization: `Bearer test-token-${user.uid}`,
        },
    }),

    /**
     * Create a mock request object without authentication
     */
    createUnauthenticatedRequest: () => ({
        headers: {},
    }),

    /**
     * Setup authentication middleware mock
     */
    setupAuthMiddleware: (user = TestDataFactory.createUser()) => {
        const mockAuthMiddleware = (req, res, next) => {
            req.user = user;
            next();
        };
        return mockAuthMiddleware;
    },

    /**
     * Create mock JWT token
     */
    createMockToken: (uid = "test-user-uid") => `mock-jwt-token-${uid}`,
};

/**
 * Database Helpers - Mock database operations
 */
export const DatabaseHelpers = {
    /**
     * Create a mock Firestore document
     */
    createMockDoc: (data, exists = true) => ({
        exists: exists,
        data: () => data,
        id: data.id || "mock-doc-id",
        ref: {
            update: jest.fn().mockResolvedValue(),
            delete: jest.fn().mockResolvedValue(),
        },
    }),

    /**
     * Create a mock Firestore collection
     */
    createMockCollection: (docs = []) => ({
        docs: docs.map((doc) => DatabaseHelpers.createMockDoc(doc)),
        empty: docs.length === 0,
        size: docs.length,
    }),

    /**
     * Create a mock Firestore query
     */
    createMockQuery: (docs = []) => ({
        get: jest.fn().mockResolvedValue(DatabaseHelpers.createMockCollection(docs)),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockReturnThis(),
    }),

    /**
     * Create a mock Firestore batch
     */
    createMockBatch: () => ({
        update: jest.fn(),
        delete: jest.fn(),
        commit: jest.fn().mockResolvedValue(),
    }),
};

/**
 * Request/Response Helpers - Mock HTTP request and response objects
 */
export const RequestHelpers = {
    /**
     * Create a mock Express request object
     */
    createMockRequest: (overrides = {}) => ({
        body: {},
        params: {},
        query: {},
        headers: {},
        user: null,
        ...overrides,
    }),

    /**
     * Create a mock Express response object
     */
    createMockResponse: () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.send = jest.fn().mockReturnValue(res);
        res.end = jest.fn().mockReturnValue(res);
        return res;
    },

    /**
     * Create a mock Express next function
     */
    createMockNext: () => jest.fn(),
};

/**
 * Error Helpers - Create various error scenarios for testing
 */
export const ErrorHelpers = {
    /**
     * Create a mock database error
     */
    createDatabaseError: (message = "Database connection failed") => ({
        code: "database/connection-failed",
        message,
        stack: "Error: Database connection failed\n    at mockFunction",
    }),

    /**
     * Create a mock authentication error
     */
    createAuthError: (message = "Authentication failed") => ({
        code: "auth/authentication-failed",
        message,
        stack: "Error: Authentication failed\n    at mockFunction",
    }),

    /**
     * Create a mock validation error
     */
    createValidationError: (message = "Validation failed") => ({
        code: "validation/invalid-input",
        message,
        stack: "Error: Validation failed\n    at mockFunction",
    }),

    /**
     * Create a mock network error
     */
    createNetworkError: (message = "Network request failed") => ({
        code: "network/request-failed",
        message,
        stack: "Error: Network request failed\n    at mockFunction",
    }),
};

/**
 * Performance Helpers - Measure and mock performance metrics
 */
export const PerformanceHelpers = {
    /**
     * Create a mock performance timer
     */
    createMockTimer: () => {
        const start = Date.now();
        return {
            start,
            end: () => Date.now() - start,
            duration: () => Date.now() - start,
        };
    },

    /**
     * Mock slow database operation
     */
    mockSlowOperation: (delay = 1000) => {
        return new Promise((resolve) => {
            setTimeout(resolve, delay);
        });
    },

    /**
     * Create mock performance metrics
     */
    createMockMetrics: () => ({
        responseTime: Math.random() * 1000,
        memoryUsage: Math.random() * 1000000,
        cpuUsage: Math.random() * 100,
        requestCount: Math.floor(Math.random() * 1000),
    }),
};

/**
 * Validation Helpers - Test input validation scenarios
 */
export const ValidationHelpers = {
    /**
     * Create invalid user data for testing validation
     */
    createInvalidUserData: () => ({
        email: "invalid-email",
        name: "",
        modules: "not-an-array",
        year: "not-a-number",
    }),

    /**
     * Create invalid group data for testing validation
     */
    createInvalidGroupData: () => ({
        name: "",
        description: null,
        module: "",
        maxMembers: "not-a-number",
    }),

    /**
     * Create invalid progress data for testing validation
     */
    createInvalidProgressData: () => ({
        topic: "",
        hours: "not-a-number",
        module: "",
        notes: null,
    }),

    /**
     * Create invalid notification data for testing validation
     */
    createInvalidNotificationData: () => ({
        userId: "",
        title: "",
        body: "",
        type: "invalid-type",
    }),
};

/**
 * Test Environment Helpers - Manage test environment state
 */
export const TestEnvironmentHelpers = {
    /**
     * Setup test environment variables
     */
    setupTestEnvironment: () => {
        process.env.NODE_ENV = "test";
        process.env.FIREBASE_PROJECT_ID = "test-project";
        process.env.OPENWEATHER_API_KEY = "test-api-key";
        process.env.MAX_FILE_SIZE = "10485760";
        process.env.ALLOWED_FILE_TYPES = "application/pdf";
        process.env.RATE_LIMIT_WINDOW_MS = "900000";
        process.env.RATE_LIMIT_MAX_REQUESTS = "100";
    },

    /**
     * Clean up test environment
     */
    cleanupTestEnvironment: () => {
        jest.clearAllMocks();
        jest.resetAllMocks();
        jest.restoreAllMocks();
    },

    /**
     * Setup test database state
     */
    setupTestDatabase: (initialData = {}) => {
        return {
            users: initialData.users || [],
            groups: initialData.groups || [],
            progress: initialData.progress || [],
            notifications: initialData.notifications || [],
            messages: initialData.messages || {},
        };
    },
};

/**
 * Assertion Helpers - Custom assertion utilities
 */
export const AssertionHelpers = {
    /**
     * Assert that a response has the correct structure
     */
    assertResponseStructure: (response, expectedStructure) => {
        expect(response).toHaveProperty("success");
        expect(response).toHaveProperty("data");
        if (expectedStructure.message) {
            expect(response).toHaveProperty("message");
        }
        if (expectedStructure.error) {
            expect(response).toHaveProperty("error");
        }
    },

    /**
     * Assert that a response contains pagination data
     */
    assertPaginationData: (response) => {
        expect(response.data).toHaveProperty("results");
        expect(response.data).toHaveProperty("page");
        expect(response.data).toHaveProperty("limit");
        expect(response.data).toHaveProperty("total");
        expect(response.data).toHaveProperty("totalPages");
    },

    /**
     * Assert that a user has the correct properties
     */
    assertUserProperties: (user) => {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("uid");
        expect(user).toHaveProperty("email");
        expect(user).toHaveProperty("name");
        expect(user).toHaveProperty("modules");
        expect(Array.isArray(user.modules)).toBe(true);
    },

    /**
     * Assert that a group has the correct properties
     */
    assertGroupProperties: (group) => {
        expect(group).toHaveProperty("id");
        expect(group).toHaveProperty("name");
        expect(group).toHaveProperty("module");
        expect(group).toHaveProperty("maxMembers");
        expect(group).toHaveProperty("currentMembers");
        expect(group).toHaveProperty("members");
        expect(Array.isArray(group.members)).toBe(true);
    },
};

export default {
    TestDataFactory,
    AuthHelpers,
    DatabaseHelpers,
    RequestHelpers,
    ErrorHelpers,
    PerformanceHelpers,
    ValidationHelpers,
    TestEnvironmentHelpers,
    AssertionHelpers,
};
