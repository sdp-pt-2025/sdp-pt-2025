import { jest } from "@jest/globals";

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
    initializeApp: jest.fn(),
    credential: {
        applicationDefault: jest.fn(),
    },
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
            })),
            add: jest.fn(),
            where: jest.fn(() => ({
                get: jest.fn(),
                orderBy: jest.fn(() => ({
                    get: jest.fn(),
                    limit: jest.fn(() => ({
                        get: jest.fn(),
                        offset: jest.fn(() => ({
                            get: jest.fn(),
                        })),
                    })),
                })),
            })),
            orderBy: jest.fn(() => ({
                get: jest.fn(),
                limit: jest.fn(() => ({
                    get: jest.fn(),
                    offset: jest.fn(() => ({
                        get: jest.fn(),
                    })),
                })),
            })),
        })),
    })),
    storage: jest.fn(() => ({
        bucket: jest.fn(() => ({
            file: jest.fn(() => ({
                createWriteStream: jest.fn(),
                delete: jest.fn(),
                makePublic: jest.fn(),
            })),
        })),
    })),
    messaging: jest.fn(() => ({
        send: jest.fn(),
        sendMulticast: jest.fn(),
    })),
    FieldValue: {
        serverTimestamp: jest.fn(() => new Date()),
        arrayUnion: jest.fn(),
        arrayRemove: jest.fn(),
        increment: jest.fn(),
    },
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.FIREBASE_PROJECT_ID = "test-project";
process.env.OPENWEATHER_API_KEY = "test-api-key";
process.env.MAX_FILE_SIZE = "10485760";
process.env.ALLOWED_FILE_TYPES = "application/pdf";
process.env.RATE_LIMIT_WINDOW_MS = "900000";
process.env.RATE_LIMIT_MAX_REQUESTS = "100";

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
};
