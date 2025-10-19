import request from "supertest";
import express from "express";
import progressRouter from "../../routes/progress.js";
import { TestDataFactory, AuthHelpers, AssertionHelpers } from "../helpers/testHelpers.js";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/progress", progressRouter);

describe("Progress Tracking API Integration Tests", () => {
    let testUser;
    let testProgress;

    beforeEach(() => {
        testUser = TestDataFactory.createUser();
        testProgress = TestDataFactory.createProgressEntry();
        
        // Mock authentication middleware
        app.use((req, res, next) => {
            req.user = testUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/progress", () => {
        it("should log study progress successfully", async () => {
            const progressData = {
                topic: "Design Patterns",
                hours: 2.5,
                module: "COMS3011",
                notes: "Covered Singleton, Factory, and Observer patterns",
                completed: true
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.topic).toBe(progressData.topic);
            expect(response.body.data.hours).toBe(progressData.hours);
            expect(response.body.data.module).toBe(progressData.module.toUpperCase());
            expect(response.body.data.notes).toBe(progressData.notes);
            expect(response.body.data.completed).toBe(progressData.completed);
            expect(response.body.data.userId).toBe(testUser.uid);
            expect(response.body.data.date).toBeDefined();
            expect(response.body.message).toBe("Study progress logged successfully");
        });

        it("should log progress with minimal required data", async () => {
            const minimalProgressData = {
                topic: "Basic Topic",
                hours: 1.0,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(minimalProgressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.topic).toBe(minimalProgressData.topic);
            expect(response.body.data.hours).toBe(minimalProgressData.hours);
            expect(response.body.data.module).toBe(minimalProgressData.module.toUpperCase());
            expect(response.body.data.notes).toBe(""); // Default value
            expect(response.body.data.completed).toBe(false); // Default value
        });

        it("should convert module to uppercase", async () => {
            const progressData = {
                topic: "Test Topic",
                hours: 1.5,
                module: "coms3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.data.module).toBe("COMS3011");
        });

        it("should handle decimal hours", async () => {
            const progressData = {
                topic: "Decimal Hours Test",
                hours: 1.75,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.data.hours).toBe(1.75);
        });

        it("should handle zero hours", async () => {
            const progressData = {
                topic: "Zero Hours Test",
                hours: 0,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.data.hours).toBe(0);
        });

        it("should handle negative hours gracefully", async () => {
            const progressData = {
                topic: "Negative Hours Test",
                hours: -1.5,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.data.hours).toBe(-1.5);
            // Current implementation allows negative hours - this documents the behavior
        });

        it("should handle server errors during progress logging", async () => {
            // Mock a server error
            const originalPost = progressRouter.post;
            progressRouter.post("/", (req, res) => {
                throw new Error("Simulated database error");
            });

            const progressData = {
                topic: "Error Test",
                hours: 1.0,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Failed to log study progress");
            expect(response.body.message).toBe("Simulated database error");

            // Restore original route
            progressRouter.post("/", originalPost);
        });

        it("should handle missing required fields", async () => {
            const incompleteProgressData = {
                hours: 1.0
                // Missing topic and module
            };

            const response = await request(app)
                .post("/api/progress")
                .send(incompleteProgressData)
                .expect(201); // Current implementation doesn't validate required fields

            // This test documents current behavior
            expect(response.body.success).toBe(true);
        });
    });

    describe("GET /api/progress/:userId", () => {
        it("should return user's study progress", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("progress");
            expect(response.body.data).toHaveProperty("summary");
            expect(Array.isArray(response.body.data.progress)).toBe(true);
        });

        it("should include progress summary statistics", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.summary).toHaveProperty("totalHours");
            expect(response.body.data.summary).toHaveProperty("completedTopics");
            expect(response.body.data.summary).toHaveProperty("totalTopics");
            expect(response.body.data.summary).toHaveProperty("averageHoursPerSession");

            // Validate data types
            expect(typeof response.body.data.summary.totalHours).toBe("number");
            expect(typeof response.body.data.summary.completedTopics).toBe("number");
            expect(typeof response.body.data.summary.totalTopics).toBe("number");
            expect(typeof response.body.data.summary.averageHoursPerSession).toBe("number");
        });

        it("should filter progress by module", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}?module=COMS3011`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.progress).toBeDefined();

            // All returned progress entries should match the module filter
            response.body.data.progress.forEach((entry) => {
                expect(entry.module.toLowerCase()).toContain("coms3011");
            });
        });

        it("should handle case-insensitive module filtering", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}?module=coms3011`)
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should work with lowercase module names
        });

        it("should limit results based on query parameter", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}?limit=5`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.progress.length).toBeLessThanOrEqual(5);
        });

        it("should prevent users from viewing other users' progress", async () => {
            const otherUserId = "other-user-uid";
            
            const response = await request(app)
                .get(`/api/progress/${otherUserId}`)
                .expect(403);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("You can only view your own progress");
        });

        it("should handle invalid limit parameter", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}?limit=invalid`)
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should default to 50 when limit is invalid
        });

        it("should return empty progress for new user", async () => {
            const newUser = TestDataFactory.createUser({
                uid: "new-user-uid"
            });

            app.use((req, res, next) => {
                req.user = newUser;
                next();
            });

            const response = await request(app)
                .get(`/api/progress/${newUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.progress).toEqual([]);
            expect(response.body.data.summary.totalHours).toBe(0);
            expect(response.body.data.summary.completedTopics).toBe(0);
            expect(response.body.data.summary.totalTopics).toBe(0);
            expect(response.body.data.summary.averageHoursPerSession).toBe(0);
        });

        it("should calculate average hours per session correctly", async () => {
            // This test would require setting up test data with known values
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            
            const { totalHours, totalTopics, averageHoursPerSession } = response.body.data.summary;
            
            if (totalTopics > 0) {
                expect(averageHoursPerSession).toBe(totalHours / totalTopics);
            } else {
                expect(averageHoursPerSession).toBe(0);
            }
        });
    });

    describe("Error Handling", () => {
        it("should handle server errors gracefully", async () => {
            // Mock a server error
            const originalGet = progressRouter.get;
            progressRouter.get("/:userId", (req, res) => {
                throw new Error("Simulated database error");
            });

            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Failed to fetch study progress");
            expect(response.body.message).toBe("Simulated database error");

            // Restore original route
            progressRouter.get("/:userId", originalGet);
        });

        it("should handle malformed request data", async () => {
            const response = await request(app)
                .post("/api/progress")
                .send("invalid json")
                .expect(400); // Express will return 400 for malformed JSON
        });

        it("should handle very large hour values", async () => {
            const progressData = {
                topic: "Long Study Session",
                hours: 999999,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.hours).toBe(999999);
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const startTime = Date.now();

            await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        });

        it("should handle concurrent progress operations", async () => {
            const requests = [
                request(app).get(`/api/progress/${testUser.uid}`),
                request(app).post("/api/progress").send({
                    topic: "Concurrent Test 1",
                    hours: 1.0,
                    module: "COMS3011"
                }),
                request(app).post("/api/progress").send({
                    topic: "Concurrent Test 2",
                    hours: 2.0,
                    module: "COMS3028"
                })
            ];

            const responses = await Promise.all(requests);

            responses.forEach((response) => {
                expect([200, 201]).toContain(response.status);
            });
        });
    });

    describe("Data Validation", () => {
        it("should validate progress data structure", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            response.body.data.progress.forEach((entry) => {
                // Validate required fields
                expect(entry.id).toBeDefined();
                expect(entry.userId).toBeDefined();
                expect(entry.topic).toBeDefined();
                expect(entry.module).toBeDefined();
                expect(entry.hours).toBeDefined();
                expect(entry.completed).toBeDefined();
                expect(entry.date).toBeDefined();

                // Validate data types
                expect(typeof entry.id).toBe("string");
                expect(typeof entry.userId).toBe("string");
                expect(typeof entry.topic).toBe("string");
                expect(typeof entry.module).toBe("string");
                expect(typeof entry.hours).toBe("number");
                expect(typeof entry.completed).toBe("boolean");
                expect(typeof entry.date).toBe("string");

                // Validate ranges
                expect(entry.hours).toBeGreaterThanOrEqual(0);
            });
        });

        it("should validate summary statistics", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            const summary = response.body.data.summary;
            
            // Validate data types
            expect(typeof summary.totalHours).toBe("number");
            expect(typeof summary.completedTopics).toBe("number");
            expect(typeof summary.totalTopics).toBe("number");
            expect(typeof summary.averageHoursPerSession).toBe("number");

            // Validate logical constraints
            expect(summary.totalHours).toBeGreaterThanOrEqual(0);
            expect(summary.completedTopics).toBeGreaterThanOrEqual(0);
            expect(summary.totalTopics).toBeGreaterThanOrEqual(0);
            expect(summary.completedTopics).toBeLessThanOrEqual(summary.totalTopics);
            expect(summary.averageHoursPerSession).toBeGreaterThanOrEqual(0);
        });

        it("should ensure module codes are uppercase", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            response.body.data.progress.forEach((entry) => {
                expect(entry.module).toBe(entry.module.toUpperCase());
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle very long topic names", async () => {
            const longTopic = "A".repeat(1000);
            const progressData = {
                topic: longTopic,
                hours: 1.0,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.topic).toBe(longTopic);
        });

        it("should handle very long notes", async () => {
            const longNotes = "A".repeat(10000);
            const progressData = {
                topic: "Test Topic",
                hours: 1.0,
                module: "COMS3011",
                notes: longNotes
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.notes).toBe(longNotes);
        });

        it("should handle special characters in topic and notes", async () => {
            const progressData = {
                topic: "Topic with Special Chars: !@#$%^&*()",
                hours: 1.0,
                module: "COMS3011",
                notes: "Notes with émojis 🎓📚 and symbols: αβγ"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.topic).toBe(progressData.topic);
            expect(response.body.data.notes).toBe(progressData.notes);
        });

        it("should handle very small decimal hours", async () => {
            const progressData = {
                topic: "Short Study Session",
                hours: 0.01,
                module: "COMS3011"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.hours).toBe(0.01);
        });

        it("should handle empty module filter", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}?module=`)
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should return all progress entries when module is empty
        });

        it("should handle non-existent module filter", async () => {
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}?module=NONEXISTENT`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.progress).toEqual([]);
        });
    });

    describe("Bulk Operations", () => {
        it("should handle multiple progress entries for the same user", async () => {
            const progressEntries = [
                {
                    topic: "Topic 1",
                    hours: 1.0,
                    module: "COMS3011"
                },
                {
                    topic: "Topic 2",
                    hours: 2.0,
                    module: "COMS3028"
                },
                {
                    topic: "Topic 3",
                    hours: 1.5,
                    module: "COMS3011"
                }
            ];

            // Log multiple progress entries
            for (const entry of progressEntries) {
                await request(app)
                    .post("/api/progress")
                    .send(entry)
                    .expect(201);
            }

            // Retrieve all progress
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.progress.length).toBeGreaterThanOrEqual(3);
        });

        it("should calculate correct totals for multiple entries", async () => {
            // This test would require setting up known test data
            const response = await request(app)
                .get(`/api/progress/${testUser.uid}`)
                .expect(200);

            expect(response.body.success).toBe(true);

            const { progress, summary } = response.body.data;
            
            // Calculate expected totals
            const expectedTotalHours = progress.reduce((sum, entry) => sum + entry.hours, 0);
            const expectedCompletedTopics = progress.filter(entry => entry.completed).length;
            const expectedTotalTopics = progress.length;

            expect(summary.totalHours).toBe(expectedTotalHours);
            expect(summary.completedTopics).toBe(expectedCompletedTopics);
            expect(summary.totalTopics).toBe(expectedTotalTopics);
        });
    });
});
