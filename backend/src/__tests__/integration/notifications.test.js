import request from "supertest";
import express from "express";
import notificationsRouter from "../../routes/notifications.js";
import { TestDataFactory, AuthHelpers, DatabaseHelpers } from "../helpers/testHelpers.js";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/notifications", notificationsRouter);

// Mock Firebase Admin
const mockFirebaseAdmin = {
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
        })),
        batch: jest.fn(() => DatabaseHelpers.createMockBatch()),
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
};

// Mock the firebase-admin module
jest.mock("firebase-admin", () => mockFirebaseAdmin);

describe("Notifications API Integration Tests", () => {
    let testUser;
    let testNotification;

    beforeEach(() => {
        testUser = TestDataFactory.createUser();
        testNotification = TestDataFactory.createNotification();
        
        // Mock authentication middleware
        app.use((req, res, next) => {
            req.user = testUser;
            next();
        });

        // Reset all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/notifications/send", () => {
        it("should send a notification successfully", async () => {
            const notificationData = {
                userId: "target-user-uid",
                title: "Test Notification",
                body: "This is a test notification",
                type: "general",
                data: { key: "value" }
            };

            // Mock user document exists
            const mockUserDoc = DatabaseHelpers.createMockDoc({
                id: "target-user-uid",
                fcmToken: "test-fcm-token"
            });

            // Mock FCM send success
            mockFirebaseAdmin.messaging().send.mockResolvedValue("test-message-id");

            // Mock Firestore operations
            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);
            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.messageId).toBe("test-message-id");
            expect(response.body.notification).toBeDefined();
            expect(response.body.notification.title).toBe(notificationData.title);
            expect(response.body.notification.body).toBe(notificationData.body);
        });

        it("should send notification with minimal required data", async () => {
            const minimalNotificationData = {
                userId: "target-user-uid",
                title: "Minimal Notification",
                body: "Minimal body"
            };

            // Mock user document exists
            const mockUserDoc = DatabaseHelpers.createMockDoc({
                id: "target-user-uid",
                fcmToken: "test-fcm-token"
            });

            // Mock FCM send success
            mockFirebaseAdmin.messaging().send.mockResolvedValue("test-message-id");

            // Mock Firestore operations
            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);
            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/send")
                .send(minimalNotificationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.notification.type).toBe("general"); // Default value
            expect(response.body.notification.data).toEqual({}); // Default value
        });

        it("should validate required fields", async () => {
            const invalidNotificationData = {
                // Missing userId, title, body
                type: "general"
            };

            const response = await request(app)
                .post("/api/notifications/send")
                .send(invalidNotificationData)
                .expect(400);

            expect(response.body.error).toBe("Validation error");
            expect(response.body.details).toBeDefined();
            expect(Array.isArray(response.body.details)).toBe(true);
        });

        it("should validate notification type", async () => {
            const invalidNotificationData = {
                userId: "target-user-uid",
                title: "Test",
                body: "Test body",
                type: "invalid-type"
            };

            const response = await request(app)
                .post("/api/notifications/send")
                .send(invalidNotificationData)
                .expect(400);

            expect(response.body.error).toBe("Validation error");
        });

        it("should handle user not found", async () => {
            const notificationData = {
                userId: "nonexistent-user",
                title: "Test",
                body: "Test body"
            };

            // Mock user document doesn't exist
            const mockUserDoc = DatabaseHelpers.createMockDoc({}, false);

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(404);

            expect(response.body.error).toBe("User not found");
            expect(response.body.message).toBe("The specified user does not exist");
        });

        it("should handle missing FCM token", async () => {
            const notificationData = {
                userId: "target-user-uid",
                title: "Test",
                body: "Test body"
            };

            // Mock user document exists but no FCM token
            const mockUserDoc = DatabaseHelpers.createMockDoc({
                id: "target-user-uid"
                // No fcmToken
            });

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(400);

            expect(response.body.error).toBe("FCM token not found");
            expect(response.body.message).toBe("User has not registered for notifications");
        });

        it("should handle FCM send failure", async () => {
            const notificationData = {
                userId: "target-user-uid",
                title: "Test",
                body: "Test body"
            };

            // Mock user document exists
            const mockUserDoc = DatabaseHelpers.createMockDoc({
                id: "target-user-uid",
                fcmToken: "test-fcm-token"
            });

            // Mock FCM send failure
            const fcmError = new Error("FCM send failed");
            fcmError.code = "messaging/registration-token-not-registered";
            mockFirebaseAdmin.messaging().send.mockRejectedValue(fcmError);

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(400);

            expect(response.body.error).toBe("Invalid FCM token");
            expect(response.body.message).toBe("The user's notification token is no longer valid");
        });

        it("should handle general FCM errors", async () => {
            const notificationData = {
                userId: "target-user-uid",
                title: "Test",
                body: "Test body"
            };

            // Mock user document exists
            const mockUserDoc = DatabaseHelpers.createMockDoc({
                id: "target-user-uid",
                fcmToken: "test-fcm-token"
            });

            // Mock FCM send failure
            mockFirebaseAdmin.messaging().send.mockRejectedValue(new Error("General FCM error"));

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(500);

            expect(response.body.error).toBe("Failed to send notification");
        });
    });

    describe("POST /api/notifications/send-bulk", () => {
        it("should send bulk notifications successfully", async () => {
            const bulkNotificationData = {
                userIds: ["user1", "user2", "user3"],
                title: "Bulk Notification",
                body: "This is a bulk notification",
                type: "general"
            };

            // Mock user documents exist
            const mockUserDocs = [
                DatabaseHelpers.createMockDoc({ id: "user1", fcmToken: "token1" }),
                DatabaseHelpers.createMockDoc({ id: "user2", fcmToken: "token2" }),
                DatabaseHelpers.createMockDoc({ id: "user3", fcmToken: "token3" })
            ];

            // Mock FCM multicast success
            mockFirebaseAdmin.messaging().sendMulticast.mockResolvedValue({
                successCount: 3,
                failureCount: 0,
                responses: [
                    { success: true, messageId: "msg1" },
                    { success: true, messageId: "msg2" },
                    { success: true, messageId: "msg3" }
                ]
            });

            // Mock Firestore operations
            mockFirebaseAdmin.firestore().collection().doc().get
                .mockResolvedValueOnce(mockUserDocs[0])
                .mockResolvedValueOnce(mockUserDocs[1])
                .mockResolvedValueOnce(mockUserDocs[2]);
            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/send-bulk")
                .send(bulkNotificationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.sent).toBe(3);
            expect(response.body.failed).toBe(0);
            expect(response.body.responses).toHaveLength(3);
        });

        it("should handle partial bulk notification failures", async () => {
            const bulkNotificationData = {
                userIds: ["user1", "user2", "user3"],
                title: "Bulk Notification",
                body: "This is a bulk notification"
            };

            // Mock user documents - one missing FCM token
            const mockUserDocs = [
                DatabaseHelpers.createMockDoc({ id: "user1", fcmToken: "token1" }),
                DatabaseHelpers.createMockDoc({ id: "user2" }), // No FCM token
                DatabaseHelpers.createMockDoc({ id: "user3", fcmToken: "token3" })
            ];

            // Mock FCM multicast partial success
            mockFirebaseAdmin.messaging().sendMulticast.mockResolvedValue({
                successCount: 2,
                failureCount: 0,
                responses: [
                    { success: true, messageId: "msg1" },
                    { success: true, messageId: "msg3" }
                ]
            });

            // Mock Firestore operations
            mockFirebaseAdmin.firestore().collection().doc().get
                .mockResolvedValueOnce(mockUserDocs[0])
                .mockResolvedValueOnce(mockUserDocs[1])
                .mockResolvedValueOnce(mockUserDocs[2]);
            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/send-bulk")
                .send(bulkNotificationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.sent).toBe(2);
            expect(response.body.failed).toBe(0);
            expect(response.body.invalidUsers).toContain("user2");
        });

        it("should validate bulk notification data", async () => {
            const invalidBulkData = {
                userIds: [], // Empty array
                title: "Test",
                body: "Test body"
            };

            const response = await request(app)
                .post("/api/notifications/send-bulk")
                .send(invalidBulkData)
                .expect(400);

            expect(response.body.error).toBe("Validation error");
        });

        it("should handle no valid tokens", async () => {
            const bulkNotificationData = {
                userIds: ["user1", "user2"],
                title: "Bulk Notification",
                body: "This is a bulk notification"
            };

            // Mock user documents without FCM tokens
            const mockUserDocs = [
                DatabaseHelpers.createMockDoc({ id: "user1" }), // No FCM token
                DatabaseHelpers.createMockDoc({ id: "user2" })  // No FCM token
            ];

            mockFirebaseAdmin.firestore().collection().doc().get
                .mockResolvedValueOnce(mockUserDocs[0])
                .mockResolvedValueOnce(mockUserDocs[1]);

            const response = await request(app)
                .post("/api/notifications/send-bulk")
                .send(bulkNotificationData)
                .expect(400);

            expect(response.body.error).toBe("No valid tokens found");
        });
    });

    describe("GET /api/notifications", () => {
        it("should return user's notifications", async () => {
            const mockNotifications = TestDataFactory.createMultipleNotifications(3, testUser.uid);
            const mockCollection = DatabaseHelpers.createMockCollection(mockNotifications);

            mockFirebaseAdmin.firestore().collection().where().orderBy().limit().offset().get
                .mockResolvedValue(mockCollection);

            const response = await request(app)
                .get("/api/notifications")
                .expect(200);

            expect(response.body.notifications).toBeDefined();
            expect(response.body.total).toBe(3);
            expect(response.body.limit).toBe(50);
            expect(response.body.offset).toBe(0);
        });

        it("should handle pagination parameters", async () => {
            const mockNotifications = TestDataFactory.createMultipleNotifications(5, testUser.uid);
            const mockCollection = DatabaseHelpers.createMockCollection(mockNotifications);

            mockFirebaseAdmin.firestore().collection().where().orderBy().limit().offset().get
                .mockResolvedValue(mockCollection);

            const response = await request(app)
                .get("/api/notifications?limit=10&offset=5")
                .expect(200);

            expect(response.body.limit).toBe(10);
            expect(response.body.offset).toBe(5);
        });

        it("should filter unread notifications", async () => {
            const mockNotifications = TestDataFactory.createMultipleNotifications(3, testUser.uid);
            const mockCollection = DatabaseHelpers.createMockCollection(mockNotifications);

            mockFirebaseAdmin.firestore().collection().where().orderBy().limit().offset().get
                .mockResolvedValue(mockCollection);

            const response = await request(app)
                .get("/api/notifications?unreadOnly=true")
                .expect(200);

            expect(response.body.notifications).toBeDefined();
        });
    });

    describe("PUT /api/notifications/:id/read", () => {
        it("should mark notification as read", async () => {
            const notificationId = "test-notification-id";
            const mockNotificationDoc = DatabaseHelpers.createMockDoc({
                id: notificationId,
                userId: testUser.uid,
                read: false
            });

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockNotificationDoc);
            mockFirebaseAdmin.firestore().collection().doc().update.mockResolvedValue();

            const response = await request(app)
                .put(`/api/notifications/${notificationId}/read`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Notification marked as read");
        });

        it("should handle notification not found", async () => {
            const notificationId = "nonexistent-id";
            const mockNotificationDoc = DatabaseHelpers.createMockDoc({}, false);

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockNotificationDoc);

            const response = await request(app)
                .put(`/api/notifications/${notificationId}/read`)
                .expect(404);

            expect(response.body.error).toBe("Notification not found");
        });

        it("should prevent marking other users' notifications as read", async () => {
            const notificationId = "test-notification-id";
            const mockNotificationDoc = DatabaseHelpers.createMockDoc({
                id: notificationId,
                userId: "other-user-uid", // Different user
                read: false
            });

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockNotificationDoc);

            const response = await request(app)
                .put(`/api/notifications/${notificationId}/read`)
                .expect(403);

            expect(response.body.error).toBe("Access denied");
        });
    });

    describe("PUT /api/notifications/read-all", () => {
        it("should mark all notifications as read", async () => {
            const mockNotifications = TestDataFactory.createMultipleNotifications(3, testUser.uid);
            const mockCollection = DatabaseHelpers.createMockCollection(mockNotifications);

            mockFirebaseAdmin.firestore().collection().where().where().get.mockResolvedValue(mockCollection);
            mockFirebaseAdmin.firestore().batch().commit.mockResolvedValue();

            const response = await request(app)
                .put("/api/notifications/read-all")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("Marked 3 notifications as read");
        });

        it("should handle no unread notifications", async () => {
            const mockCollection = DatabaseHelpers.createMockCollection([]);

            mockFirebaseAdmin.firestore().collection().where().where().get.mockResolvedValue(mockCollection);

            const response = await request(app)
                .put("/api/notifications/read-all")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("Marked 0 notifications as read");
        });
    });

    describe("DELETE /api/notifications/:id", () => {
        it("should delete notification successfully", async () => {
            const notificationId = "test-notification-id";
            const mockNotificationDoc = DatabaseHelpers.createMockDoc({
                id: notificationId,
                userId: testUser.uid
            });

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockNotificationDoc);
            mockFirebaseAdmin.firestore().collection().doc().delete.mockResolvedValue();

            const response = await request(app)
                .delete(`/api/notifications/${notificationId}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("Notification deleted successfully");
        });

        it("should handle notification not found", async () => {
            const notificationId = "nonexistent-id";
            const mockNotificationDoc = DatabaseHelpers.createMockDoc({}, false);

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockNotificationDoc);

            const response = await request(app)
                .delete(`/api/notifications/${notificationId}`)
                .expect(404);

            expect(response.body.error).toBe("Notification not found");
        });

        it("should prevent deleting other users' notifications", async () => {
            const notificationId = "test-notification-id";
            const mockNotificationDoc = DatabaseHelpers.createMockDoc({
                id: notificationId,
                userId: "other-user-uid"
            });

            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockNotificationDoc);

            const response = await request(app)
                .delete(`/api/notifications/${notificationId}`)
                .expect(403);

            expect(response.body.error).toBe("Access denied");
        });
    });

    describe("POST /api/notifications/register-token", () => {
        it("should register FCM token successfully", async () => {
            const tokenData = {
                fcmToken: "new-fcm-token-123"
            };

            mockFirebaseAdmin.firestore().collection().doc().update.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/register-token")
                .send(tokenData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe("FCM token registered successfully");
        });

        it("should validate FCM token", async () => {
            const invalidTokenData = {
                fcmToken: "" // Empty token
            };

            const response = await request(app)
                .post("/api/notifications/register-token")
                .send(invalidTokenData)
                .expect(400);

            expect(response.body.error).toBe("Validation error");
        });
    });

    describe("POST /api/notifications/schedule-reminder", () => {
        it("should schedule a reminder successfully", async () => {
            const reminderData = {
                title: "Study Reminder",
                body: "Time to study!",
                scheduledTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                data: { module: "COMS3011" }
            };

            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue({
                id: "reminder-id"
            });

            const response = await request(app)
                .post("/api/notifications/schedule-reminder")
                .send(reminderData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.reminderId).toBe("reminder-id");
            expect(response.body.message).toBe("Study reminder scheduled successfully");
        });

        it("should validate scheduled time is in the future", async () => {
            const reminderData = {
                title: "Study Reminder",
                body: "Time to study!",
                scheduledTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                data: { module: "COMS3011" }
            };

            const response = await request(app)
                .post("/api/notifications/schedule-reminder")
                .send(reminderData)
                .expect(400);

            expect(response.body.error).toBe("Invalid scheduled time");
            expect(response.body.message).toBe("Scheduled time must be in the future");
        });

        it("should validate reminder data", async () => {
            const invalidReminderData = {
                title: "", // Empty title
                body: "Time to study!",
                scheduledTime: new Date(Date.now() + 3600000).toISOString()
            };

            const response = await request(app)
                .post("/api/notifications/schedule-reminder")
                .send(invalidReminderData)
                .expect(400);

            expect(response.body.error).toBe("Validation error");
        });
    });

    describe("Error Handling", () => {
        it("should handle Firestore errors gracefully", async () => {
            const notificationData = {
                userId: "target-user-uid",
                title: "Test",
                body: "Test body"
            };

            // Mock Firestore error
            mockFirebaseAdmin.firestore().collection().doc().get.mockRejectedValue(
                new Error("Firestore connection failed")
            );

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(500);

            expect(response.body.error).toBe("Failed to send notification");
        });

        it("should handle malformed request data", async () => {
            const response = await request(app)
                .post("/api/notifications/send")
                .send("invalid json")
                .expect(400);
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const mockCollection = DatabaseHelpers.createMockCollection([]);
            mockFirebaseAdmin.firestore().collection().where().orderBy().limit().offset().get
                .mockResolvedValue(mockCollection);

            const startTime = Date.now();

            await request(app)
                .get("/api/notifications")
                .expect(200);

            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000);
        });

        it("should handle concurrent notification operations", async () => {
            const mockCollection = DatabaseHelpers.createMockCollection([]);
            mockFirebaseAdmin.firestore().collection().where().orderBy().limit().offset().get
                .mockResolvedValue(mockCollection);

            const requests = [
                request(app).get("/api/notifications"),
                request(app).get("/api/notifications?limit=10"),
                request(app).get("/api/notifications?unreadOnly=true")
            ];

            const responses = await Promise.all(requests);

            responses.forEach((response) => {
                expect(response.status).toBe(200);
            });
        });
    });

    describe("Data Validation", () => {
        it("should validate notification data structure", async () => {
            const mockNotifications = TestDataFactory.createMultipleNotifications(1, testUser.uid);
            const mockCollection = DatabaseHelpers.createMockCollection(mockNotifications);

            mockFirebaseAdmin.firestore().collection().where().orderBy().limit().offset().get
                .mockResolvedValue(mockCollection);

            const response = await request(app)
                .get("/api/notifications")
                .expect(200);

            expect(response.body.notifications).toBeDefined();
            expect(Array.isArray(response.body.notifications)).toBe(true);

            if (response.body.notifications.length > 0) {
                const notification = response.body.notifications[0];
                expect(notification.id).toBeDefined();
                expect(notification.userId).toBeDefined();
                expect(notification.title).toBeDefined();
                expect(notification.body).toBeDefined();
                expect(notification.type).toBeDefined();
            }
        });
    });

    describe("Edge Cases", () => {
        it("should handle very long notification titles and bodies", async () => {
            const longTitle = "A".repeat(1000);
            const longBody = "B".repeat(10000);
            const notificationData = {
                userId: "target-user-uid",
                title: longTitle,
                body: longBody
            };

            const mockUserDoc = DatabaseHelpers.createMockDoc({
                id: "target-user-uid",
                fcmToken: "test-fcm-token"
            });

            mockFirebaseAdmin.messaging().send.mockResolvedValue("test-message-id");
            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);
            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.notification.title).toBe(longTitle);
            expect(response.body.notification.body).toBe(longBody);
        });

        it("should handle special characters in notification content", async () => {
            const notificationData = {
                userId: "target-user-uid",
                title: "Notification with émojis 🎓📚",
                body: "Body with special chars: !@#$%^&*() and symbols: αβγ"
            };

            const mockUserDoc = DatabaseHelpers.createMockDoc({
                id: "target-user-uid",
                fcmToken: "test-fcm-token"
            });

            mockFirebaseAdmin.messaging().send.mockResolvedValue("test-message-id");
            mockFirebaseAdmin.firestore().collection().doc().get.mockResolvedValue(mockUserDoc);
            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/send")
                .send(notificationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.notification.title).toBe(notificationData.title);
            expect(response.body.notification.body).toBe(notificationData.body);
        });

        it("should handle large bulk notification requests", async () => {
            const largeUserList = Array.from({ length: 100 }, (_, i) => `user${i}`);
            const bulkNotificationData = {
                userIds: largeUserList,
                title: "Bulk Notification",
                body: "This is a bulk notification"
            };

            // Mock all users exist with FCM tokens
            const mockUserDocs = largeUserList.map(userId => 
                DatabaseHelpers.createMockDoc({ id: userId, fcmToken: `token-${userId}` })
            );

            mockFirebaseAdmin.messaging().sendMulticast.mockResolvedValue({
                successCount: 100,
                failureCount: 0,
                responses: largeUserList.map(() => ({ success: true, messageId: "msg" }))
            });

            mockFirebaseAdmin.firestore().collection().doc().get
                .mockImplementation(() => Promise.resolve(mockUserDocs.shift()));
            mockFirebaseAdmin.firestore().collection().add.mockResolvedValue();

            const response = await request(app)
                .post("/api/notifications/send-bulk")
                .send(bulkNotificationData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.sent).toBe(100);
        });
    });
});
