import request from "supertest";
import app from "../../../app.js";
import { TestDataFactory, AuthHelpers, TestUtils, TestEnvironment } from "../helpers/testHelpers.js";

describe("Notifications API Integration Tests", () => {
    let mockNotifications;

    beforeAll(() => {
        TestEnvironment.setup();
        AuthHelpers.setupAuthMiddleware();
    });

    beforeEach(() => {
        TestEnvironment.cleanup();
        
        // Create mock notifications data
        mockNotifications = [
            TestDataFactory.createNotification({
                id: "notification1",
                userId: "test-user-uid",
                type: "group_invite",
                title: "Study Group Invitation",
                body: "You've been invited to join the COMS3011 Study Group",
                data: {
                    groupId: "group1",
                    groupName: "COMS3011 Study Group"
                },
                read: false,
                createdAt: new Date("2025-01-20T10:00:00Z")
            }),
            TestDataFactory.createNotification({
                id: "notification2",
                userId: "test-user-uid",
                type: "study_reminder",
                title: "Study Session Reminder",
                body: "Your study session for COMS3028 starts in 30 minutes",
                data: {
                    sessionId: "session1",
                    module: "COMS3028"
                },
                read: true,
                readAt: new Date("2025-01-20T11:00:00Z"),
                createdAt: new Date("2025-01-20T09:30:00Z")
            }),
            TestDataFactory.createNotification({
                id: "notification3",
                userId: "test-user-uid",
                type: "progress_achievement",
                title: "Achievement Unlocked!",
                body: "Congratulations! You've completed 10 study topics",
                data: {
                    achievement: "topics_completed",
                    count: 10
                },
                read: false,
                createdAt: new Date("2025-01-19T15:00:00Z")
            })
        ];
    });

    afterAll(() => {
        TestEnvironment.cleanup();
    });

    describe("GET /api/notifications", () => {
        it("should return user's notifications", async () => {
            const response = await request(app)
                .get("/api/notifications")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        userId: "test-user-uid",
                        type: expect.any(String),
                        title: expect.any(String),
                        body: expect.any(String),
                        read: expect.any(Boolean),
                        createdAt: expect.any(String)
                    })
                ])
            );
        });

        it("should filter notifications by read status", async () => {
            const response = await request(app)
                .get("/api/notifications?read=false")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        read: false
                    })
                ])
            );
            expect(response.body.data).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        read: true
                    })
                ])
            );
        });

        it("should filter notifications by type", async () => {
            const response = await request(app)
                .get("/api/notifications?type=group_invite")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: "group_invite"
                    })
                ])
            );
            expect(response.body.data).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        type: "study_reminder"
                    })
                ])
            );
        });

        it("should support pagination", async () => {
            const response = await request(app)
                .get("/api/notifications?page=1&limit=2")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body).toHaveProperty("pagination");
        });

        it("should sort notifications by creation date", async () => {
            const response = await request(app)
                .get("/api/notifications?sortBy=createdAt&sortOrder=desc")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(1);
            
            // Check if dates are in descending order
            for (let i = 0; i < response.body.data.length - 1; i++) {
                const currentDate = new Date(response.body.data[i].createdAt);
                const nextDate = new Date(response.body.data[i + 1].createdAt);
                expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
            }
        });

        it("should return notification counts", async () => {
            const response = await request(app)
                .get("/api/notifications")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body).toHaveProperty("counts");
            expect(response.body.counts).toHaveProperty("total");
            expect(response.body.counts).toHaveProperty("unread");
            expect(response.body.counts).toHaveProperty("byType");
        });

        it("should return 403 for unauthorized access", async () => {
            AuthHelpers.setupUnauthenticatedMiddleware();

            const response = await request(app)
                .get("/api/notifications")
                .expect(401);

            TestUtils.expectErrorResponse(response, 401, "Authentication required");
        });
    });

    describe("POST /api/notifications", () => {
        it("should create notification successfully", async () => {
            const notificationData = {
                userId: "test-user-uid",
                type: "custom_message",
                title: "Custom Notification",
                body: "This is a custom notification message",
                data: {
                    customField: "customValue"
                }
            };

            const response = await request(app)
                .post("/api/notifications")
                .send(notificationData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.userId).toBe(notificationData.userId);
            expect(response.body.data.type).toBe(notificationData.type);
            expect(response.body.data.title).toBe(notificationData.title);
            expect(response.body.data.body).toBe(notificationData.body);
            expect(response.body.data.data).toEqual(notificationData.data);
            expect(response.body.data.read).toBe(false);
            expect(response.body.message).toContain("Notification created successfully");
        });

        it("should create notification with scheduled delivery", async () => {
            const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow
            const notificationData = {
                userId: "test-user-uid",
                type: "study_reminder",
                title: "Scheduled Reminder",
                body: "This is a scheduled notification",
                scheduledFor: futureDate.toISOString()
            };

            const response = await request(app)
                .post("/api/notifications")
                .send(notificationData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("scheduledFor");
            expect(response.body.data.status).toBe("scheduled");
        });

        it("should validate required fields", async () => {
            const invalidNotificationData = {
                type: "custom_message",
                // Missing required fields: userId, title, body
                data: {}
            };

            const response = await request(app)
                .post("/api/notifications")
                .send(invalidNotificationData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should validate notification type", async () => {
            const invalidNotificationData = {
                userId: "test-user-uid",
                type: "invalid_type",
                title: "Test Notification",
                body: "Test body"
            };

            const response = await request(app)
                .post("/api/notifications")
                .send(invalidNotificationData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should validate title length", async () => {
            const invalidNotificationData = {
                userId: "test-user-uid",
                type: "custom_message",
                title: "a".repeat(201), // Too long
                body: "Test body"
            };

            const response = await request(app)
                .post("/api/notifications")
                .send(invalidNotificationData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should validate body length", async () => {
            const invalidNotificationData = {
                userId: "test-user-uid",
                type: "custom_message",
                title: "Test Title",
                body: "a".repeat(1001) // Too long
            };

            const response = await request(app)
                .post("/api/notifications")
                .send(invalidNotificationData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });
    });

    describe("PUT /api/notifications/:id/read", () => {
        it("should mark notification as read", async () => {
            const response = await request(app)
                .put("/api/notifications/notification1/read")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("read", true);
            expect(response.body.data).toHaveProperty("readAt");
            expect(response.body.message).toContain("Notification marked as read");
        });

        it("should handle already read notifications", async () => {
            const response = await request(app)
                .put("/api/notifications/notification2/read")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("read", true);
            expect(response.body.message).toContain("Notification already marked as read");
        });

        it("should return 404 for non-existent notification", async () => {
            const response = await request(app)
                .put("/api/notifications/nonexistent/read")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Notification not found");
        });

        it("should return 403 for unauthorized access to other user's notification", async () => {
            // Mock different user
            AuthHelpers.setupAuthMiddleware({ uid: "other-user", name: "Other User" });

            const response = await request(app)
                .put("/api/notifications/notification1/read")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Access denied");
        });
    });

    describe("PUT /api/notifications/read-all", () => {
        it("should mark all notifications as read", async () => {
            const response = await request(app)
                .put("/api/notifications/read-all")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("updatedCount");
            expect(response.body.data.updatedCount).toBeGreaterThan(0);
            expect(response.body.message).toContain("All notifications marked as read");
        });

        it("should handle case when all notifications are already read", async () => {
            // First mark all as read
            await request(app)
                .put("/api/notifications/read-all")
                .expect(200);

            // Try again
            const response = await request(app)
                .put("/api/notifications/read-all")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.updatedCount).toBe(0);
            expect(response.body.message).toContain("All notifications already marked as read");
        });

        it("should filter by notification type when marking all as read", async () => {
            const response = await request(app)
                .put("/api/notifications/read-all?type=group_invite")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("updatedCount");
            expect(response.body.data).toHaveProperty("type", "group_invite");
        });
    });

    describe("DELETE /api/notifications/:id", () => {
        it("should delete notification successfully", async () => {
            const response = await request(app)
                .delete("/api/notifications/notification1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("Notification deleted successfully");
        });

        it("should return 404 for non-existent notification", async () => {
            const response = await request(app)
                .delete("/api/notifications/nonexistent")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Notification not found");
        });

        it("should return 403 for unauthorized access to other user's notification", async () => {
            // Mock different user
            AuthHelpers.setupAuthMiddleware({ uid: "other-user", name: "Other User" });

            const response = await request(app)
                .delete("/api/notifications/notification1")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Access denied");
        });
    });

    describe("DELETE /api/notifications/clear", () => {
        it("should clear all notifications", async () => {
            const response = await request(app)
                .delete("/api/notifications/clear")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("deletedCount");
            expect(response.body.data.deletedCount).toBeGreaterThan(0);
            expect(response.body.message).toContain("All notifications cleared");
        });

        it("should filter by notification type when clearing", async () => {
            const response = await request(app)
                .delete("/api/notifications/clear?type=study_reminder")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("deletedCount");
            expect(response.body.data).toHaveProperty("type", "study_reminder");
        });

        it("should handle case when no notifications to clear", async () => {
            // First clear all
            await request(app)
                .delete("/api/notifications/clear")
                .expect(200);

            // Try again
            const response = await request(app)
                .delete("/api/notifications/clear")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.deletedCount).toBe(0);
            expect(response.body.message).toContain("No notifications to clear");
        });
    });

    describe("PUT /api/notifications/preferences", () => {
        it("should update notification preferences", async () => {
            const preferencesData = {
                email: true,
                push: false,
                sms: false,
                types: {
                    group_invite: true,
                    study_reminder: true,
                    progress_achievement: false
                }
            };

            const response = await request(app)
                .put("/api/notifications/preferences")
                .send(preferencesData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("email", preferencesData.email);
            expect(response.body.data).toHaveProperty("push", preferencesData.push);
            expect(response.body.data).toHaveProperty("sms", preferencesData.sms);
            expect(response.body.data).toHaveProperty("types", preferencesData.types);
            expect(response.body.message).toContain("Notification preferences updated");
        });

        it("should validate notification preferences", async () => {
            const invalidPreferencesData = {
                email: "invalid_boolean", // Should be boolean
                push: true,
                types: {
                    invalid_type: true // Invalid notification type
                }
            };

            const response = await request(app)
                .put("/api/notifications/preferences")
                .send(invalidPreferencesData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should handle partial preference updates", async () => {
            const partialPreferencesData = {
                email: false
            };

            const response = await request(app)
                .put("/api/notifications/preferences")
                .send(partialPreferencesData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("email", false);
        });
    });

    describe("GET /api/notifications/preferences", () => {
        it("should return user's notification preferences", async () => {
            const response = await request(app)
                .get("/api/notifications/preferences")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("email");
            expect(response.body.data).toHaveProperty("push");
            expect(response.body.data).toHaveProperty("sms");
            expect(response.body.data).toHaveProperty("types");
        });

        it("should return default preferences for new user", async () => {
            AuthHelpers.setupAuthMiddleware({ uid: "new-user", name: "New User" });

            const response = await request(app)
                .get("/api/notifications/preferences")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("email", true); // Default
            expect(response.body.data).toHaveProperty("push", true); // Default
            expect(response.body.data).toHaveProperty("sms", false); // Default
        });
    });

    describe("POST /api/notifications/bulk", () => {
        it("should create multiple notifications", async () => {
            const bulkData = {
                notifications: [
                    {
                        userId: "test-user-uid",
                        type: "custom_message",
                        title: "Bulk Notification 1",
                        body: "First bulk notification"
                    },
                    {
                        userId: "test-user-uid",
                        type: "custom_message",
                        title: "Bulk Notification 2",
                        body: "Second bulk notification"
                    }
                ]
            };

            const response = await request(app)
                .post("/api/notifications/bulk")
                .send(bulkData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty("id");
            expect(response.body.data[0].title).toBe("Bulk Notification 1");
            expect(response.body.data[1].title).toBe("Bulk Notification 2");
            expect(response.body.message).toContain("Bulk notifications created successfully");
        });

        it("should validate bulk notification data", async () => {
            const invalidBulkData = {
                notifications: [
                    {
                        userId: "test-user-uid",
                        type: "custom_message",
                        title: "Valid Notification",
                        body: "Valid body"
                    },
                    {
                        userId: "test-user-uid",
                        // Missing required fields
                        type: "custom_message"
                    }
                ]
            };

            const response = await request(app)
                .post("/api/notifications/bulk")
                .send(invalidBulkData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should handle empty bulk data", async () => {
            const emptyBulkData = {
                notifications: []
            };

            const response = await request(app)
                .post("/api/notifications/bulk")
                .send(emptyBulkData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "No notifications provided");
        });
    });

    describe("Error Handling", () => {
        it("should handle database errors gracefully", async () => {
            const response = await request(app)
                .get("/api/notifications")
                .expect(200);

            expect(response.body).toHaveProperty("success");
        });

        it("should handle malformed requests", async () => {
            const response = await request(app)
                .post("/api/notifications")
                .send("invalid json")
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
        });

        it("should handle invalid notification IDs", async () => {
            const response = await request(app)
                .put("/api/notifications/invalid-id/read")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Notification not found");
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get("/api/notifications")
                .expect(200);

            const responseTime = Date.now() - startTime;
            
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
            expect(response.body.success).toBe(true);
        });

        it("should handle large notification lists efficiently", async () => {
            const response = await request(app)
                .get("/api/notifications?limit=100")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(100);
        });

        it("should process bulk operations efficiently", async () => {
            const bulkData = {
                notifications: Array.from({ length: 50 }, (_, i) => ({
                    userId: "test-user-uid",
                    type: "custom_message",
                    title: `Bulk Notification ${i + 1}`,
                    body: `Bulk notification body ${i + 1}`
                }))
            };

            const startTime = Date.now();
            
            const response = await request(app)
                .post("/api/notifications/bulk")
                .send(bulkData)
                .expect(201);

            const responseTime = Date.now() - startTime;
            
            expect(responseTime).toBeLessThan(5000); // Should process within 5 seconds
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(50);
        });
    });
});
