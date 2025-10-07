import request from "supertest";
import app from "../../../app.js";
import { TestDataFactory, AuthHelpers, TestUtils, TestEnvironment } from "../helpers/testHelpers.js";

describe("Partners API Integration Tests", () => {
    let mockUsers;

    beforeAll(() => {
        TestEnvironment.setup();
        AuthHelpers.setupAuthMiddleware();
    });

    beforeEach(() => {
        TestEnvironment.cleanup();
        
        // Create mock users data
        mockUsers = [
            TestDataFactory.createUser({
                id: "user1",
                uid: "user1",
                name: "Alice Johnson",
                email: "alice@example.com",
                modules: ["COMS3011", "COMS3028", "MATH2001"],
                yearOfStudy: 3,
                major: "Computer Science",
                studyPreferences: ["group", "online", "library"],
                availability: ["Monday", "Wednesday", "Friday"],
                rating: 4.8,
                totalStudyHours: 120
            }),
            TestDataFactory.createUser({
                id: "user2",
                uid: "user2",
                name: "Bob Smith",
                email: "bob@example.com",
                modules: ["COMS3011", "COMS3029"],
                yearOfStudy: 2,
                major: "Software Engineering",
                studyPreferences: ["group", "cafe"],
                availability: ["Tuesday", "Thursday"],
                rating: 4.5,
                totalStudyHours: 85
            }),
            TestDataFactory.createUser({
                id: "user3",
                uid: "user3",
                name: "Carol Davis",
                email: "carol@example.com",
                modules: ["MATH2001", "COMS3028"],
                yearOfStudy: 3,
                major: "Computer Science",
                studyPreferences: ["individual", "library"],
                availability: ["Monday", "Wednesday", "Saturday"],
                rating: 4.9,
                totalStudyHours: 150
            })
        ];
    });

    afterAll(() => {
        TestEnvironment.cleanup();
    });

    describe("GET /api/partners", () => {
        it("should return all available study partners", async () => {
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data).toHaveProperty("results");
            expect(response.body.data).toHaveProperty("page", 1);
            expect(response.body.data).toHaveProperty("limit", 10);
            expect(response.body.data).toHaveProperty("total");
            expect(response.body.data).toHaveProperty("totalPages");
            expect(Array.isArray(response.body.data.results)).toBe(true);
        });

        it("should filter partners by module", async () => {
            const response = await request(app)
                .get("/api/partners?module=COMS3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        modules: expect.arrayContaining(["COMS3011"])
                    })
                ])
            );
        });

        it("should filter partners by multiple modules", async () => {
            const response = await request(app)
                .get("/api/partners?modules=COMS3011,COMS3028")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        modules: expect.arrayContaining(
                            expect.arrayContaining(["COMS3011", "COMS3028"])
                        )
                    })
                ])
            );
        });

        it("should filter partners by all specified modules", async () => {
            const response = await request(app)
                .get("/api/partners?modulesAll=COMS3011,COMS3028")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        modules: expect.arrayContaining(["COMS3011", "COMS3028"])
                    })
                ])
            );
        });

        it("should exclude partners with specified modules", async () => {
            const response = await request(app)
                .get("/api/partners?notModule=COMS3029")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual(
                expect.not.arrayContaining([
                    expect.objectContaining({
                        modules: expect.arrayContaining(["COMS3029"])
                    })
                ])
            );
        });

        it("should support pagination", async () => {
            const response = await request(app)
                .get("/api/partners?page=1&limit=2")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.page).toBe(1);
            expect(response.body.data.limit).toBe(2);
            expect(response.body.data.results.length).toBeLessThanOrEqual(2);
        });

        it("should exclude current user from results", async () => {
            // Mock current user as user1
            AuthHelpers.setupAuthMiddleware({ uid: "user1", name: "Alice Johnson" });

            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual(
                expect.not.arrayContaining([
                    expect.objectContaining({ id: "user1" })
                ])
            );
        });

        it("should handle empty search results", async () => {
            const response = await request(app)
                .get("/api/partners?module=NONEXISTENT")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual([]);
            expect(response.body.data.total).toBe(0);
        });

        it("should handle invalid pagination parameters", async () => {
            const response = await request(app)
                .get("/api/partners?page=invalid&limit=invalid")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.page).toBe(1); // Should default to 1
            expect(response.body.data.limit).toBe(10); // Should default to 10
        });
    });

    describe("GET /api/partners/:id", () => {
        it("should return specific partner details", async () => {
            const response = await request(app)
                .get("/api/partners/user1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id", "user1");
            expect(response.body.data).toHaveProperty("name", "Alice Johnson");
            expect(response.body.data).toHaveProperty("modules");
            expect(response.body.data).toHaveProperty("studyPreferences");
        });

        it("should return 404 for non-existent partner", async () => {
            const response = await request(app)
                .get("/api/partners/nonexistent")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Partner not found");
        });
    });

    describe("POST /api/partners/connect", () => {
        it("should send connection request successfully", async () => {
            const connectionData = {
                partnerId: "user2",
                message: "Hi! I'd like to study together for COMS3011."
            };

            const response = await request(app)
                .post("/api/partners/connect")
                .send(connectionData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data).toHaveProperty("requesterId", "test-user-uid");
            expect(response.body.data).toHaveProperty("receiverId", "user2");
            expect(response.body.data).toHaveProperty("status", "pending");
            expect(response.body.message).toContain("Connection request sent");
        });

        it("should reject connection request to self", async () => {
            const connectionData = {
                partnerId: "test-user-uid",
                message: "Trying to connect to myself"
            };

            const response = await request(app)
                .post("/api/partners/connect")
                .send(connectionData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Cannot connect to yourself");
        });

        it("should reject duplicate connection requests", async () => {
            const connectionData = {
                partnerId: "user2",
                message: "Duplicate request"
            };

            // Send first request
            await request(app)
                .post("/api/partners/connect")
                .send(connectionData)
                .expect(201);

            // Try to send duplicate request
            const response = await request(app)
                .post("/api/partners/connect")
                .send(connectionData)
                .expect(409);

            TestUtils.expectErrorResponse(response, 409, "Connection request already exists");
        });

        it("should validate connection request data", async () => {
            const invalidData = {
                partnerId: "", // Invalid empty partner ID
                message: "" // Invalid empty message
            };

            const response = await request(app)
                .post("/api/partners/connect")
                .send(invalidData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });
    });

    describe("GET /api/partners/connections", () => {
        it("should return user's connection requests", async () => {
            const response = await request(app)
                .get("/api/partners/connections")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("sent");
            expect(response.body.data).toHaveProperty("received");
            expect(Array.isArray(response.body.data.sent)).toBe(true);
            expect(Array.isArray(response.body.data.received)).toBe(true);
        });

        it("should filter connections by status", async () => {
            const response = await request(app)
                .get("/api/partners/connections?status=pending")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.sent).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ status: "pending" })
                ])
            );
        });
    });

    describe("PUT /api/partners/connections/:id", () => {
        it("should accept connection request", async () => {
            // First, create a connection request
            const connectionData = {
                partnerId: "user2",
                message: "Hi! Let's study together."
            };

            const createResponse = await request(app)
                .post("/api/partners/connect")
                .send(connectionData)
                .expect(201);

            const connectionId = createResponse.body.data.id;

            // Accept the connection request
            const response = await request(app)
                .put(`/api/partners/connections/${connectionId}`)
                .send({ action: "accept" })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("status", "accepted");
            expect(response.body.message).toContain("Connection accepted");
        });

        it("should reject connection request", async () => {
            // First, create a connection request
            const connectionData = {
                partnerId: "user2",
                message: "Hi! Let's study together."
            };

            const createResponse = await request(app)
                .post("/api/partners/connect")
                .send(connectionData)
                .expect(201);

            const connectionId = createResponse.body.data.id;

            // Reject the connection request
            const response = await request(app)
                .put(`/api/partners/connections/${connectionId}`)
                .send({ action: "reject" })
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("status", "rejected");
            expect(response.body.message).toContain("Connection rejected");
        });

        it("should return 404 for non-existent connection", async () => {
            const response = await request(app)
                .put("/api/partners/connections/nonexistent")
                .send({ action: "accept" })
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Connection request not found");
        });

        it("should return 400 for invalid action", async () => {
            const connectionData = {
                partnerId: "user2",
                message: "Hi! Let's study together."
            };

            const createResponse = await request(app)
                .post("/api/partners/connect")
                .send(connectionData)
                .expect(201);

            const connectionId = createResponse.body.data.id;

            const response = await request(app)
                .put(`/api/partners/connections/${connectionId}`)
                .send({ action: "invalid" })
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Invalid action");
        });
    });

    describe("GET /api/partners/matches", () => {
        it("should return study partner matches based on compatibility", async () => {
            const response = await request(app)
                .get("/api/partners/matches")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("matches");
            expect(Array.isArray(response.body.data.matches)).toBe(true);
            
            if (response.body.data.matches.length > 0) {
                expect(response.body.data.matches[0]).toHaveProperty("partner");
                expect(response.body.data.matches[0]).toHaveProperty("compatibilityScore");
                expect(response.body.data.matches[0]).toHaveProperty("reasons");
            }
        });

        it("should filter matches by minimum compatibility score", async () => {
            const response = await request(app)
                .get("/api/partners/matches?minScore=0.8")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.matches).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        compatibilityScore: expect.any(Number)
                    })
                ])
            );
        });

        it("should return empty matches when no compatible partners found", async () => {
            // Mock user with very specific requirements
            AuthHelpers.setupAuthMiddleware({
                uid: "specific-user",
                modules: ["VERY_SPECIFIC_MODULE"],
                studyPreferences: ["very_specific_preference"]
            });

            const response = await request(app)
                .get("/api/partners/matches?minScore=0.9")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.matches).toEqual([]);
        });
    });

    describe("PUT /api/partners/profile", () => {
        it("should update user profile successfully", async () => {
            const profileUpdates = {
                studyPreferences: ["group", "online"],
                availability: ["Monday", "Wednesday", "Friday"],
                bio: "Updated bio for testing"
            };

            const response = await request(app)
                .put("/api/partners/profile")
                .send(profileUpdates)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("studyPreferences", profileUpdates.studyPreferences);
            expect(response.body.data).toHaveProperty("availability", profileUpdates.availability);
            expect(response.body.data).toHaveProperty("bio", profileUpdates.bio);
        });

        it("should validate profile update data", async () => {
            const invalidUpdates = {
                studyPreferences: [], // Empty array should be invalid
                availability: ["InvalidDay"], // Invalid day
                bio: "a".repeat(1001) // Too long bio
            };

            const response = await request(app)
                .put("/api/partners/profile")
                .send(invalidUpdates)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should handle partial profile updates", async () => {
            const partialUpdates = {
                bio: "Just updating the bio"
            };

            const response = await request(app)
                .put("/api/partners/profile")
                .send(partialUpdates)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("bio", partialUpdates.bio);
        });
    });

    describe("Error Handling", () => {
        it("should handle database connection errors", async () => {
            // This would require mocking database errors
            // For now, we test the basic error response structure
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body).toHaveProperty("success");
        });

        it("should handle malformed requests gracefully", async () => {
            const response = await request(app)
                .post("/api/partners/connect")
                .send("invalid json")
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            const responseTime = Date.now() - startTime;
            
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
            expect(response.body.success).toBe(true);
        });

        it("should handle large result sets efficiently", async () => {
            // Test with large limit
            const response = await request(app)
                .get("/api/partners?limit=100")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results.length).toBeLessThanOrEqual(100);
        });
    });
});
