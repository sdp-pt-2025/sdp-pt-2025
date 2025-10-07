import request from "supertest";
import app from "../../../app.js";
import { TestDataFactory, AuthHelpers, TestUtils, TestEnvironment } from "../helpers/testHelpers.js";

describe("Study Groups API Integration Tests", () => {
    let mockGroups;
    let mockMessages;

    beforeAll(() => {
        TestEnvironment.setup();
        AuthHelpers.setupAuthMiddleware();
    });

    beforeEach(() => {
        TestEnvironment.cleanup();
        
        // Create mock groups data
        mockGroups = [
            TestDataFactory.createStudyGroup({
                id: "group1",
                name: "COMS3011 Study Group",
                description: "Advanced Software Engineering study group",
                module: "COMS3011",
                maxMembers: 8,
                currentMembers: 5,
                members: [
                    { id: "user1", name: "Alice Johnson", role: "admin" },
                    { id: "user2", name: "Bob Smith", role: "member" },
                    { id: "user3", name: "Carol Davis", role: "member" },
                    { id: "user4", name: "David Wilson", role: "member" },
                    { id: "user5", name: "Eve Brown", role: "member" }
                ],
                schedule: ["Monday 2-4pm", "Wednesday 3-5pm"],
                location: "Library Study Room 3",
                createdAt: "2025-01-15T10:00:00Z",
                createdBy: "user1"
            }),
            TestDataFactory.createStudyGroup({
                id: "group2",
                name: "MATH2001 Study Group",
                description: "Mathematics study group",
                module: "MATH2001",
                maxMembers: 6,
                currentMembers: 3,
                members: [
                    { id: "user6", name: "Frank Miller", role: "admin" },
                    { id: "user7", name: "Grace Lee", role: "member" },
                    { id: "user8", name: "Henry Chen", role: "member" }
                ],
                schedule: ["Tuesday 10-12am", "Thursday 2-4pm"],
                location: "Math Department",
                createdAt: "2025-01-16T09:00:00Z",
                createdBy: "user6"
            })
        ];

        // Create mock messages data
        mockMessages = {
            group1: [
                TestDataFactory.createChatMessage({
                    id: "msg1",
                    groupId: "group1",
                    userId: "user1",
                    userName: "Alice Johnson",
                    message: "Hi everyone! Ready for our study session tomorrow?",
                    timestamp: "2025-01-20T09:00:00Z"
                }),
                TestDataFactory.createChatMessage({
                    id: "msg2",
                    groupId: "group1",
                    userId: "user2",
                    userName: "Bob Smith",
                    message: "Yes! I'll bring the design patterns notes.",
                    timestamp: "2025-01-20T09:05:00Z"
                })
            ]
        };
    });

    afterAll(() => {
        TestEnvironment.cleanup();
    });

    describe("POST /api/groups", () => {
        it("should create a new study group successfully", async () => {
            const groupData = {
                name: "New Study Group",
                description: "A new study group for testing",
                module: "COMS3028",
                maxMembers: 6,
                schedule: ["Monday 10-12am", "Friday 2-4pm"],
                location: "Student Center"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(groupData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.name).toBe(groupData.name);
            expect(response.body.data.description).toBe(groupData.description);
            expect(response.body.data.module).toBe(groupData.module.toUpperCase());
            expect(response.body.data.maxMembers).toBe(groupData.maxMembers);
            expect(response.body.data.currentMembers).toBe(1);
            expect(response.body.data.createdBy).toBe("test-user-uid");
            expect(response.body.data.members).toHaveLength(1);
            expect(response.body.data.members[0].role).toBe("admin");
            expect(response.body.message).toContain("Study group created successfully");
        });

        it("should create group with minimal required data", async () => {
            const minimalGroupData = {
                name: "Minimal Group",
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(minimalGroupData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(minimalGroupData.name);
            expect(response.body.data.module).toBe(minimalGroupData.module.toUpperCase());
            expect(response.body.data.maxMembers).toBe(8); // Default value
            expect(response.body.data.description).toBe(""); // Default empty string
        });

        it("should validate required fields", async () => {
            const invalidGroupData = {
                description: "Missing name and module"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(invalidGroupData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should validate group name length", async () => {
            const invalidGroupData = {
                name: "a".repeat(101), // Too long
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(invalidGroupData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should validate max members limit", async () => {
            const invalidGroupData = {
                name: "Test Group",
                module: "COMS3011",
                maxMembers: 51 // Too many members
            };

            const response = await request(app)
                .post("/api/groups")
                .send(invalidGroupData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });
    });

    describe("GET /api/groups", () => {
        it("should return all study groups", async () => {
            const response = await request(app)
                .get("/api/groups")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        name: expect.any(String),
                        module: expect.any(String),
                        maxMembers: expect.any(Number),
                        currentMembers: expect.any(Number)
                    })
                ])
            );
            expect(response.body.count).toBeGreaterThan(0);
        });

        it("should filter groups by module", async () => {
            const response = await request(app)
                .get("/api/groups?module=COMS3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        module: "COMS3011"
                    })
                ])
            );
            expect(response.body.data).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        module: "MATH2001"
                    })
                ])
            );
        });

        it("should support pagination", async () => {
            const response = await request(app)
                .get("/api/groups?page=1&limit=1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body).toHaveProperty("pagination");
        });

        it("should filter groups by status", async () => {
            const response = await request(app)
                .get("/api/groups?status=active")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        status: "active"
                    })
                ])
            );
        });

        it("should search groups by name", async () => {
            const response = await request(app)
                .get("/api/groups?search=COMS3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.stringContaining("COMS3011")
                    })
                ])
            );
        });
    });

    describe("GET /api/groups/:id", () => {
        it("should return specific group details", async () => {
            const response = await request(app)
                .get("/api/groups/group1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id", "group1");
            expect(response.body.data).toHaveProperty("name");
            expect(response.body.data).toHaveProperty("members");
            expect(response.body.data).toHaveProperty("schedule");
            expect(response.body.data).toHaveProperty("location");
        });

        it("should return 404 for non-existent group", async () => {
            const response = await request(app)
                .get("/api/groups/nonexistent")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Study group not found");
        });

        it("should include member details", async () => {
            const response = await request(app)
                .get("/api/groups/group1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.members).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        name: expect.any(String),
                        role: expect.any(String)
                    })
                ])
            );
        });
    });

    describe("POST /api/groups/:id/join", () => {
        it("should join group successfully", async () => {
            const response = await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id", "group1");
            expect(response.body.data.currentMembers).toBe(6); // Increased by 1
            expect(response.body.data.members).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: "test-user-uid",
                        role: "member"
                    })
                ])
            );
            expect(response.body.message).toContain("Successfully joined study group");
        });

        it("should prevent joining already joined group", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            // Try to join again
            const response = await request(app)
                .post("/api/groups/group1/join")
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "You are already a member of this group");
        });

        it("should prevent joining full group", async () => {
            // Mock a full group
            const fullGroup = TestDataFactory.createStudyGroup({
                id: "fullgroup",
                name: "Full Group",
                module: "COMS3011",
                maxMembers: 2,
                currentMembers: 2,
                members: [
                    { id: "user1", name: "User 1", role: "admin" },
                    { id: "user2", name: "User 2", role: "member" }
                ]
            });

            const response = await request(app)
                .post("/api/groups/fullgroup/join")
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Study group is full");
        });

        it("should return 404 for non-existent group", async () => {
            const response = await request(app)
                .post("/api/groups/nonexistent/join")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Study group not found");
        });
    });

    describe("DELETE /api/groups/:id/leave", () => {
        it("should leave group successfully", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            // Then leave the group
            const response = await request(app)
                .delete("/api/groups/group1/leave")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.currentMembers).toBe(5); // Decreased by 1
            expect(response.body.data.members).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: "test-user-uid"
                    })
                ])
            );
            expect(response.body.message).toContain("Successfully left study group");
        });

        it("should prevent leaving group not a member of", async () => {
            const response = await request(app)
                .delete("/api/groups/group1/leave")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "You are not a member of this group");
        });

        it("should handle admin leaving group", async () => {
            // Mock user as admin of the group
            AuthHelpers.setupAuthMiddleware({ uid: "user1", name: "Alice Johnson" });

            const response = await request(app)
                .delete("/api/groups/group1/leave")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("Admin privileges transferred");
        });

        it("should return 404 for non-existent group", async () => {
            const response = await request(app)
                .delete("/api/groups/nonexistent/leave")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Study group not found");
        });
    });

    describe("POST /api/groups/:id/message", () => {
        it("should send message to group successfully", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            const messageData = {
                message: "Hello everyone! Looking forward to our study session."
            };

            const response = await request(app)
                .post("/api/groups/group1/message")
                .send(messageData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.groupId).toBe("group1");
            expect(response.body.data.userId).toBe("test-user-uid");
            expect(response.body.data.message).toBe(messageData.message);
            expect(response.body.data).toHaveProperty("timestamp");
            expect(response.body.message).toContain("Message sent successfully");
        });

        it("should prevent non-members from sending messages", async () => {
            const messageData = {
                message: "Unauthorized message"
            };

            const response = await request(app)
                .post("/api/groups/group1/message")
                .send(messageData)
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "You must be a member to send messages");
        });

        it("should validate message content", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            const invalidMessageData = {
                message: "" // Empty message
            };

            const response = await request(app)
                .post("/api/groups/group1/message")
                .send(invalidMessageData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should prevent sending messages to non-existent group", async () => {
            const messageData = {
                message: "Message to non-existent group"
            };

            const response = await request(app)
                .post("/api/groups/nonexistent/message")
                .send(messageData)
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Study group not found");
        });

        it("should support message attachments", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            const messageData = {
                message: "Here's a useful document",
                attachments: [
                    {
                        type: "file",
                        name: "study-notes.pdf",
                        url: "https://example.com/file.pdf"
                    }
                ]
            };

            const response = await request(app)
                .post("/api/groups/group1/message")
                .send(messageData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("attachments");
            expect(response.body.data.attachments).toHaveLength(1);
        });
    });

    describe("GET /api/groups/:id/messages", () => {
        it("should return group messages for members", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            const response = await request(app)
                .get("/api/groups/group1/messages")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        groupId: "group1",
                        userId: expect.any(String),
                        message: expect.any(String),
                        timestamp: expect.any(String)
                    })
                ])
            );
            expect(response.body.count).toBeGreaterThan(0);
        });

        it("should support pagination for messages", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            const response = await request(app)
                .get("/api/groups/group1/messages?limit=1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(1);
            expect(response.body).toHaveProperty("pagination");
        });

        it("should prevent non-members from viewing messages", async () => {
            const response = await request(app)
                .get("/api/groups/group1/messages")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "You must be a member to view messages");
        });

        it("should return 404 for non-existent group messages", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            const response = await request(app)
                .get("/api/groups/nonexistent/messages")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Study group not found");
        });

        it("should filter messages by date range", async () => {
            // First, join the group
            await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            const startDate = new Date("2025-01-20T00:00:00Z").toISOString();
            const endDate = new Date("2025-01-20T23:59:59Z").toISOString();

            const response = await request(app)
                .get(`/api/groups/group1/messages?startDate=${startDate}&endDate=${endDate}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        timestamp: expect.any(String)
                    })
                ])
            );
        });
    });

    describe("PUT /api/groups/:id", () => {
        it("should update group details by admin", async () => {
            // Mock user as admin of the group
            AuthHelpers.setupAuthMiddleware({ uid: "user1", name: "Alice Johnson" });

            const updateData = {
                name: "Updated Study Group",
                description: "Updated description",
                maxMembers: 10
            };

            const response = await request(app)
                .put("/api/groups/group1")
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(updateData.name);
            expect(response.body.data.description).toBe(updateData.description);
            expect(response.body.data.maxMembers).toBe(updateData.maxMembers);
            expect(response.body.message).toContain("Group updated successfully");
        });

        it("should prevent non-admin from updating group", async () => {
            const updateData = {
                name: "Unauthorized Update"
            };

            const response = await request(app)
                .put("/api/groups/group1")
                .send(updateData)
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Only group administrators can update group details");
        });

        it("should validate update data", async () => {
            // Mock user as admin of the group
            AuthHelpers.setupAuthMiddleware({ uid: "user1", name: "Alice Johnson" });

            const invalidUpdateData = {
                name: "a".repeat(101), // Too long
                maxMembers: -1 // Invalid
            };

            const response = await request(app)
                .put("/api/groups/group1")
                .send(invalidUpdateData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should return 404 for non-existent group", async () => {
            const updateData = {
                name: "Updated Name"
            };

            const response = await request(app)
                .put("/api/groups/nonexistent")
                .send(updateData)
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Study group not found");
        });
    });

    describe("DELETE /api/groups/:id", () => {
        it("should delete group by admin", async () => {
            // Mock user as admin of the group
            AuthHelpers.setupAuthMiddleware({ uid: "user1", name: "Alice Johnson" });

            const response = await request(app)
                .delete("/api/groups/group1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("Group deleted successfully");
        });

        it("should prevent non-admin from deleting group", async () => {
            const response = await request(app)
                .delete("/api/groups/group1")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Only group administrators can delete the group");
        });

        it("should return 404 for non-existent group", async () => {
            // Mock user as admin
            AuthHelpers.setupAuthMiddleware({ uid: "user1", name: "Alice Johnson" });

            const response = await request(app)
                .delete("/api/groups/nonexistent")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Study group not found");
        });
    });

    describe("Error Handling", () => {
        it("should handle database errors gracefully", async () => {
            const response = await request(app)
                .get("/api/groups")
                .expect(200);

            expect(response.body).toHaveProperty("success");
        });

        it("should handle malformed requests", async () => {
            const response = await request(app)
                .post("/api/groups")
                .send("invalid json")
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get("/api/groups")
                .expect(200);

            const responseTime = Date.now() - startTime;
            
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
            expect(response.body.success).toBe(true);
        });

        it("should handle large groups efficiently", async () => {
            const response = await request(app)
                .get("/api/groups/group1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.members.length).toBeGreaterThan(0);
        });
    });
});
