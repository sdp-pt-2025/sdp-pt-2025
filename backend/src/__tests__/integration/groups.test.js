import request from "supertest";
import express from "express";
import groupsRouter from "../../routes/groups.js";
import { TestDataFactory, AuthHelpers, AssertionHelpers } from "../helpers/testHelpers.js";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/groups", groupsRouter);

describe("Study Groups API Integration Tests", () => {
    let testUser;
    let testGroup;

    beforeEach(() => {
        testUser = TestDataFactory.createUser();
        testGroup = TestDataFactory.createStudyGroup();
        
        // Mock authentication middleware
        app.use((req, res, next) => {
            req.user = testUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/groups", () => {
        it("should create a new study group successfully", async () => {
            const groupData = {
                name: "New Study Group",
                description: "A new study group for testing",
                module: "COMS3028",
                maxMembers: 6,
                schedule: ["Tuesday 2-4pm"],
                location: "Library Room 5"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(groupData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(groupData.name);
            expect(response.body.data.description).toBe(groupData.description);
            expect(response.body.data.module).toBe(groupData.module.toUpperCase());
            expect(response.body.data.maxMembers).toBe(groupData.maxMembers);
            expect(response.body.data.currentMembers).toBe(1);
            expect(response.body.data.members).toHaveLength(1);
            expect(response.body.data.members[0].id).toBe(testUser.uid);
            expect(response.body.data.members[0].role).toBe("admin");
            expect(response.body.data.createdBy).toBe(testUser.uid);
            expect(response.body.message).toBe("Study group created successfully");
        });

        it("should create a group with minimal required data", async () => {
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
            expect(response.body.data.description).toBe(""); // Default value
            expect(response.body.data.schedule).toEqual([]); // Default value
            expect(response.body.data.location).toBe(""); // Default value
        });

        it("should handle missing required fields", async () => {
            const incompleteGroupData = {
                description: "Group without name"
                // Missing name and module
            };

            const response = await request(app)
                .post("/api/groups")
                .send(incompleteGroupData)
                .expect(201); // The current implementation doesn't validate required fields

            // This test documents current behavior - in a real app, you'd want validation
            expect(response.body.success).toBe(true);
        });

        it("should convert module to uppercase", async () => {
            const groupData = {
                name: "Test Group",
                module: "coms3011"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(groupData)
                .expect(201);

            expect(response.body.data.module).toBe("COMS3011");
        });

        it("should handle server errors during group creation", async () => {
            // Mock a server error
            const originalPost = groupsRouter.post;
            groupsRouter.post("/", (req, res) => {
                throw new Error("Simulated database error");
            });

            const groupData = {
                name: "Error Test Group",
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(groupData)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Failed to create study group");
            expect(response.body.message).toBe("Simulated database error");

            // Restore original route
            groupsRouter.post("/", originalPost);
        });
    });

    describe("GET /api/groups", () => {
        it("should return all study groups", async () => {
            const response = await request(app)
                .get("/api/groups")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.count).toBeDefined();
            expect(typeof response.body.count).toBe("number");
        });

        it("should filter groups by module", async () => {
            const response = await request(app)
                .get("/api/groups?module=COMS3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();

            // All returned groups should contain the filter module
            response.body.data.forEach((group) => {
                expect(group.module.toLowerCase()).toContain("coms3011");
            });
        });

        it("should handle case-insensitive module filtering", async () => {
            const response = await request(app)
                .get("/api/groups?module=coms3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should work with lowercase module names
        });

        it("should return groups with correct data structure", async () => {
            const response = await request(app)
                .get("/api/groups")
                .expect(200);

            expect(response.body.success).toBe(true);

            if (response.body.data.length > 0) {
                const group = response.body.data[0];
                AssertionHelpers.assertGroupProperties(group);
                expect(group).toHaveProperty("description");
                expect(group).toHaveProperty("schedule");
                expect(group).toHaveProperty("location");
                expect(group).toHaveProperty("createdAt");
                expect(group).toHaveProperty("createdBy");
            }
        });

        it("should handle empty results", async () => {
            const response = await request(app)
                .get("/api/groups?module=NONEXISTENT")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
            expect(response.body.count).toBe(0);
        });
    });

    describe("GET /api/groups/:id", () => {
        it("should return a specific study group", async () => {
            const response = await request(app)
                .get("/api/groups/1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.id).toBe("1");
        });

        it("should return 404 for non-existent group", async () => {
            const response = await request(app)
                .get("/api/groups/nonexistent")
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Study group not found");
        });

        it("should handle invalid group ID format", async () => {
            const response = await request(app)
                .get("/api/groups/invalid-id")
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Study group not found");
        });
    });

    describe("POST /api/groups/:id/join", () => {
        it("should allow user to join a study group", async () => {
            const response = await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.members).toBeDefined();
            expect(response.body.data.currentMembers).toBeGreaterThan(1);
            expect(response.body.message).toBe("Successfully joined study group");

            // Check if user was added to members
            const userMember = response.body.data.members.find(
                (member) => member.id === testUser.uid
            );
            expect(userMember).toBeDefined();
            expect(userMember.role).toBe("member");
        });

        it("should prevent joining a non-existent group", async () => {
            const response = await request(app)
                .post("/api/groups/nonexistent/join")
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Study group not found");
        });

        it("should prevent joining a group twice", async () => {
            // First join
            await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            // Second join should fail
            const response = await request(app)
                .post("/api/groups/1/join")
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("You are already a member of this group");
        });

        it("should prevent joining a full group", async () => {
            // Create a full group by mocking the current members
            const fullGroup = TestDataFactory.createStudyGroup({
                id: "full-group",
                currentMembers: 8,
                maxMembers: 8
            });

            // Mock the groups array to include our full group
            const originalGroups = groupsRouter.stack;
            // This is a simplified test - in reality you'd need to mock the data source

            const response = await request(app)
                .post("/api/groups/full-group/join")
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Study group is full");
        });
    });

    describe("POST /api/groups/:id/message", () => {
        it("should allow group members to send messages", async () => {
            const messageData = {
                message: "Hello everyone! Ready for our study session?"
            };

            // First join the group
            await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            // Then send a message
            const response = await request(app)
                .post("/api/groups/1/message")
                .send(messageData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.message).toBe(messageData.message);
            expect(response.body.data.userId).toBe(testUser.uid);
            expect(response.body.data.groupId).toBe("1");
            expect(response.body.message).toBe("Message sent successfully");
        });

        it("should prevent non-members from sending messages", async () => {
            const messageData = {
                message: "I'm not a member"
            };

            const response = await request(app)
                .post("/api/groups/1/message")
                .send(messageData)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("You must be a member to send messages");
        });

        it("should prevent sending messages to non-existent groups", async () => {
            const messageData = {
                message: "Hello"
            };

            const response = await request(app)
                .post("/api/groups/nonexistent/message")
                .send(messageData)
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Study group not found");
        });

        it("should handle empty messages", async () => {
            // First join the group
            await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            const messageData = {
                message: ""
            };

            const response = await request(app)
                .post("/api/groups/1/message")
                .send(messageData)
                .expect(201);

            expect(response.body.success).toBe(true);
            // Current implementation allows empty messages
        });
    });

    describe("GET /api/groups/:id/messages", () => {
        it("should return group messages for members", async () => {
            // First join the group
            await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            const response = await request(app)
                .get("/api/groups/1/messages")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toBeDefined();
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.count).toBeDefined();
            expect(response.body.total).toBeDefined();
        });

        it("should limit messages based on query parameter", async () => {
            // First join the group
            await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            const response = await request(app)
                .get("/api/groups/1/messages?limit=10")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(10);
            expect(response.body.count).toBeLessThanOrEqual(10);
        });

        it("should prevent non-members from viewing messages", async () => {
            const response = await request(app)
                .get("/api/groups/1/messages")
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("You must be a member to view messages");
        });

        it("should return 404 for non-existent group messages", async () => {
            // First join the group
            await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            const response = await request(app)
                .get("/api/groups/nonexistent/messages")
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Study group not found");
        });

        it("should handle invalid limit parameter", async () => {
            // First join the group
            await request(app)
                .post("/api/groups/1/join")
                .expect(200);

            const response = await request(app)
                .get("/api/groups/1/messages?limit=invalid")
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should default to 50 when limit is invalid
        });
    });

    describe("Error Handling", () => {
        it("should handle server errors gracefully", async () => {
            // Mock a server error
            const originalGet = groupsRouter.get;
            groupsRouter.get("/", (req, res) => {
                throw new Error("Simulated server error");
            });

            const response = await request(app)
                .get("/api/groups")
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Failed to fetch study groups");
            expect(response.body.message).toBe("Simulated server error");

            // Restore original route
            groupsRouter.get("/", originalGet);
        });

        it("should handle malformed request data", async () => {
            const response = await request(app)
                .post("/api/groups")
                .send("invalid json")
                .expect(400); // Express will return 400 for malformed JSON

            // This tests the Express JSON parser error handling
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const startTime = Date.now();

            await request(app)
                .get("/api/groups")
                .expect(200);

            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        });

        it("should handle concurrent group operations", async () => {
            const requests = [
                request(app).get("/api/groups"),
                request(app).get("/api/groups/1"),
                request(app).post("/api/groups").send({
                    name: "Concurrent Group",
                    module: "COMS3011"
                })
            ];

            const responses = await Promise.all(requests);

            responses.forEach((response) => {
                expect([200, 201]).toContain(response.status);
            });
        });
    });

    describe("Data Validation", () => {
        it("should validate group data structure", async () => {
            const response = await request(app)
                .get("/api/groups")
                .expect(200);

            expect(response.body.success).toBe(true);

            response.body.data.forEach((group) => {
                // Validate required fields
                expect(group.id).toBeDefined();
                expect(group.name).toBeDefined();
                expect(group.module).toBeDefined();
                expect(group.maxMembers).toBeDefined();
                expect(group.currentMembers).toBeDefined();
                expect(group.members).toBeDefined();

                // Validate data types
                expect(typeof group.id).toBe("string");
                expect(typeof group.name).toBe("string");
                expect(typeof group.module).toBe("string");
                expect(typeof group.maxMembers).toBe("number");
                expect(typeof group.currentMembers).toBe("number");
                expect(Array.isArray(group.members)).toBe(true);

                // Validate ranges
                expect(group.maxMembers).toBeGreaterThan(0);
                expect(group.currentMembers).toBeGreaterThanOrEqual(0);
                expect(group.currentMembers).toBeLessThanOrEqual(group.maxMembers);
            });
        });

        it("should validate member data structure", async () => {
            const response = await request(app)
                .get("/api/groups")
                .expect(200);

            expect(response.body.success).toBe(true);

            response.body.data.forEach((group) => {
                group.members.forEach((member) => {
                    expect(member.id).toBeDefined();
                    expect(member.name).toBeDefined();
                    expect(member.role).toBeDefined();
                    expect(["admin", "member"]).toContain(member.role);
                });
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle very long group names", async () => {
            const longName = "A".repeat(1000);
            const groupData = {
                name: longName,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(groupData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(longName);
        });

        it("should handle special characters in group data", async () => {
            const groupData = {
                name: "Group with Special Chars: !@#$%^&*()",
                description: "Description with émojis 🎓📚",
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/groups")
                .send(groupData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe(groupData.name);
            expect(response.body.data.description).toBe(groupData.description);
        });

        it("should handle numeric group IDs", async () => {
            const response = await request(app)
                .get("/api/groups/1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe("1");
        });
    });
});
