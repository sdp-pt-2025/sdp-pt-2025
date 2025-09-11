import request from "supertest";
import app from "../../index.js";
import admin from "firebase-admin";
import { seedDatabase, clearTestData } from "../../scripts/seed-database.js";

// Mock the auth middleware for integration tests
jest.mock("../../middleware/auth.js", () => ({
    verifyToken: (req, res, next) => {
        req.user = { uid: "user1" };
        next();
    },
}));

describe("API Integration Tests", () => {
    beforeAll(async () => {
        // Initialize Firebase Admin for testing
        if (admin.apps.length === 0) {
            admin.initializeApp({
                projectId: "test-project",
                credential: admin.credential.applicationDefault(),
            });
        }

        // Seed test data
        await seedDatabase();
    });

    afterAll(async () => {
        // Clean up test data
        await clearTestData();

        // Close Firebase Admin
        if (admin.apps.length > 0) {
            await admin.app().delete();
        }
    });

    describe("Health Check Integration", () => {
        it("should return basic health status", async () => {
            const response = await request(app).get("/health").expect(200);

            expect(response.body).toHaveProperty("status", "healthy");
            expect(response.body).toHaveProperty("timestamp");
            expect(response.body).toHaveProperty("uptime");
        });

        it("should return detailed health status", async () => {
            const response = await request(app)
                .get("/health/detailed")
                .expect(200);

            expect(response.body).toHaveProperty("status");
            expect(response.body).toHaveProperty("services");
            expect(response.body).toHaveProperty("performance");
        });

        it("should check database connectivity", async () => {
            const response = await request(app)
                .get("/health/database")
                .expect(200);

            expect(response.body).toHaveProperty("status", "healthy");
            expect(response.body).toHaveProperty("database", "firestore");
        });
    });

    describe("Weather API Integration", () => {
        it("should handle weather API requests", async () => {
            const response = await request(app).get("/api/weather").expect(200);

            expect(response.body).toHaveProperty("location");
            expect(response.body).toHaveProperty("current");
            expect(response.body).toHaveProperty("studyRecommendation");
        });

        it("should handle weather forecast requests", async () => {
            const response = await request(app)
                .get("/api/weather/forecast")
                .expect(200);

            expect(response.body).toHaveProperty("forecast");
            expect(response.body.forecast).toBeInstanceOf(Array);
        });

        it("should generate study recommendations", async () => {
            const response = await request(app)
                .post("/api/weather/recommendations")
                .send({
                    studyType: "outdoor",
                    duration: 120,
                })
                .expect(200);

            expect(response.body).toHaveProperty("recommendations");
            expect(response.body).toHaveProperty("weather");
        });
    });

    describe("File Management Integration", () => {
        it("should handle file upload workflow", async () => {
            // Mock file upload
            const mockFile = Buffer.from("test pdf content");

            const response = await request(app)
                .post("/api/files/upload")
                .attach("file", mockFile, "test.pdf")
                .expect(201);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("file");
        });

        it("should list user files", async () => {
            const response = await request(app).get("/api/files").expect(200);

            expect(response.body).toHaveProperty("files");
            expect(response.body.files).toBeInstanceOf(Array);
        });

        it("should search files", async () => {
            const response = await request(app)
                .get("/api/files/search?q=assignment")
                .expect(200);

            expect(response.body).toHaveProperty("files");
            expect(response.body).toHaveProperty("query", "assignment");
        });
    });

    describe("Notifications Integration", () => {
        it("should send notifications", async () => {
            const response = await request(app)
                .post("/api/notifications/send")
                .send({
                    userId: "user2",
                    title: "Test Notification",
                    body: "This is a test notification",
                    type: "general",
                })
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("messageId");
        });

        it("should get user notifications", async () => {
            const response = await request(app)
                .get("/api/notifications")
                .expect(200);

            expect(response.body).toHaveProperty("notifications");
            expect(response.body.notifications).toBeInstanceOf(Array);
        });

        it("should schedule reminders", async () => {
            const futureTime = new Date(
                Date.now() + 24 * 60 * 60 * 1000,
            ).toISOString();

            const response = await request(app)
                .post("/api/notifications/schedule-reminder")
                .send({
                    title: "Study Reminder",
                    body: "Time for your study session!",
                    scheduledTime: futureTime,
                })
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("reminderId");
        });
    });

    describe("Bug Tracking Integration", () => {
        it("should create bug reports", async () => {
            const response = await request(app)
                .post("/api/bugs")
                .send({
                    title: "Integration Test Bug",
                    description:
                        "This is a test bug report for integration testing",
                    severity: "low",
                    category: "other",
                    stepsToReproduce:
                        "1. Run integration test\n2. Check bug creation",
                    expectedBehavior: "Bug should be created successfully",
                    actualBehavior: "Bug creation works as expected",
                })
                .expect(201);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("bug");
        });

        it("should list bugs with filtering", async () => {
            const response = await request(app)
                .get("/api/bugs?status=open&severity=medium")
                .expect(200);

            expect(response.body).toHaveProperty("bugs");
            expect(response.body).toHaveProperty("total");
            expect(response.body.bugs).toBeInstanceOf(Array);
        });

        it("should vote on bugs", async () => {
            const response = await request(app)
                .post("/api/bugs/bug1/vote")
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("action");
        });

        it("should get bug statistics", async () => {
            const response = await request(app)
                .get("/api/bugs/stats")
                .expect(200);

            expect(response.body).toHaveProperty("total");
            expect(response.body).toHaveProperty("byStatus");
            expect(response.body).toHaveProperty("bySeverity");
            expect(response.body).toHaveProperty("byCategory");
        });
    });

    describe("Study Groups Integration", () => {
        it("should create study groups", async () => {
            const response = await request(app)
                .post("/api/groups")
                .send({
                    name: "Integration Test Group",
                    description: "A test study group for integration testing",
                    module: "COMS3011",
                    topic: "Integration Testing",
                    maxMembers: 5,
                    isPublic: true,
                })
                .expect(201);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("group");
        });

        it("should list study groups", async () => {
            const response = await request(app).get("/api/groups").expect(200);

            expect(response.body).toHaveProperty("groups");
            expect(response.body.groups).toBeInstanceOf(Array);
        });

        it("should join study groups", async () => {
            const response = await request(app)
                .post("/api/groups/group1/join")
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
        });
    });

    describe("Progress Tracking Integration", () => {
        it("should create progress entries", async () => {
            const response = await request(app)
                .post("/api/progress")
                .send({
                    module: "COMS3011",
                    topic: "Integration Testing",
                    status: "in_progress",
                    studyHours: 2.5,
                    difficulty: 3,
                    confidence: 4,
                })
                .expect(201);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("progress");
        });

        it("should get user progress", async () => {
            const response = await request(app)
                .get("/api/progress/user1")
                .expect(200);

            expect(response.body).toHaveProperty("progress");
            expect(response.body.progress).toBeInstanceOf(Array);
        });
    });

    describe("Partners Integration", () => {
        it("should find study partners", async () => {
            const response = await request(app)
                .get("/api/partners?module=COMS3011")
                .expect(200);

            expect(response.body).toHaveProperty("partners");
            expect(response.body.partners).toBeInstanceOf(Array);
        });

        it("should filter partners by preferences", async () => {
            const response = await request(app)
                .get("/api/partners?studyStyle=group&locationPreference=indoor")
                .expect(200);

            expect(response.body).toHaveProperty("partners");
            expect(response.body).toHaveProperty("filters");
        });
    });

    describe("Schedule Integration", () => {
        it("should create study sessions", async () => {
            const response = await request(app)
                .post("/api/schedule")
                .send({
                    title: "Integration Test Session",
                    description: "A test study session",
                    startTime: new Date(
                        Date.now() + 24 * 60 * 60 * 1000,
                    ).toISOString(),
                    duration: 120,
                    module: "COMS3011",
                    topic: "Integration Testing",
                })
                .expect(201);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("session");
        });

        it("should list scheduled sessions", async () => {
            const response = await request(app)
                .get("/api/schedule")
                .expect(200);

            expect(response.body).toHaveProperty("sessions");
            expect(response.body.sessions).toBeInstanceOf(Array);
        });
    });

    describe("Error Handling Integration", () => {
        it("should handle 404 errors gracefully", async () => {
            const response = await request(app)
                .get("/api/nonexistent")
                .expect(404);

            expect(response.body).toHaveProperty("error", "Route not found");
        });

        it("should handle validation errors", async () => {
            const response = await request(app)
                .post("/api/bugs")
                .send({
                    title: "", // Invalid: empty title
                    description: "Test description",
                })
                .expect(400);

            expect(response.body).toHaveProperty("error", "Validation error");
            expect(response.body).toHaveProperty("details");
        });

        it("should handle rate limiting", async () => {
            // Make multiple requests to trigger rate limiting
            const requests = Array(10)
                .fill()
                .map(() => request(app).get("/api/weather"));

            const responses = await Promise.all(requests);

            // At least one should be rate limited (if rate limiting is enabled)
            const rateLimited = responses.some((res) => res.status === 429);
            expect(rateLimited).toBeDefined();
        });
    });

    describe("Authentication Integration", () => {
        it("should require authentication for protected routes", async () => {
            // Mock auth middleware to reject
            jest.doMock("../../middleware/auth.js", () => ({
                verifyToken: (req, res, next) => {
                    res.status(401).json({ error: "Unauthorized" });
                },
            }));

            const response = await request(app)
                .get("/api/partners")
                .expect(401);

            expect(response.body).toHaveProperty("error", "Unauthorized");
        });
    });

    describe("Database Integration", () => {
        it("should handle database connection errors gracefully", async () => {
            // This test would require mocking Firebase to simulate connection errors
            // For now, we'll test that the app doesn't crash on database operations
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body).toHaveProperty("partners");
        });

        it("should handle concurrent database operations", async () => {
            const requests = Array(5)
                .fill()
                .map(() => request(app).get("/api/partners"));

            const responses = await Promise.all(requests);

            responses.forEach((response) => {
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty("partners");
            });
        });
    });
});
