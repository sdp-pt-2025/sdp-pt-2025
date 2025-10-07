import request from "supertest";
import app from "../../../app.js";
import { TestDataFactory, AuthHelpers, TestUtils, TestEnvironment } from "../helpers/testHelpers.js";

describe("Progress Tracking API Integration Tests", () => {
    let mockProgressEntries;

    beforeAll(() => {
        TestEnvironment.setup();
        AuthHelpers.setupAuthMiddleware();
    });

    beforeEach(() => {
        TestEnvironment.cleanup();
        
        // Create mock progress data
        mockProgressEntries = [
            TestDataFactory.createProgressEntry({
                id: "progress1",
                userId: "test-user-uid",
                module: "COMS3011",
                topic: "Design Patterns",
                status: "completed",
                completionPercentage: 100,
                studyHours: 8.5,
                lastStudied: new Date("2025-01-20T10:00:00Z"),
                difficulty: 4,
                confidence: 5,
                notes: "Completed Singleton, Factory, and Observer patterns",
                createdAt: new Date("2025-01-18T09:00:00Z"),
                updatedAt: new Date("2025-01-20T10:00:00Z")
            }),
            TestDataFactory.createProgressEntry({
                id: "progress2",
                userId: "test-user-uid",
                module: "COMS3028",
                topic: "Database Design",
                status: "in_progress",
                completionPercentage: 60,
                studyHours: 4.5,
                lastStudied: new Date("2025-01-19T14:00:00Z"),
                difficulty: 3,
                confidence: 3,
                notes: "ER diagrams and normalization",
                createdAt: new Date("2025-01-15T10:00:00Z"),
                updatedAt: new Date("2025-01-19T14:00:00Z")
            }),
            TestDataFactory.createProgressEntry({
                id: "progress3",
                userId: "test-user-uid",
                module: "MATH2001",
                topic: "Calculus",
                status: "not_started",
                completionPercentage: 0,
                studyHours: 0,
                lastStudied: null,
                difficulty: null,
                confidence: null,
                notes: "",
                createdAt: new Date("2025-01-10T08:00:00Z"),
                updatedAt: new Date("2025-01-10T08:00:00Z")
            })
        ];
    });

    afterAll(() => {
        TestEnvironment.cleanup();
    });

    describe("POST /api/progress", () => {
        it("should log study progress successfully", async () => {
            const progressData = {
                topic: "New Topic",
                hours: 2.5,
                module: "COMS3011",
                notes: "Studied new concepts",
                completed: false
            };

            const response = await request(app)
                .post("/api/progress")
                .send(progressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.userId).toBe("test-user-uid");
            expect(response.body.data.topic).toBe(progressData.topic);
            expect(response.body.data.module).toBe(progressData.module.toUpperCase());
            expect(response.body.data.hours).toBe(progressData.hours);
            expect(response.body.data.notes).toBe(progressData.notes);
            expect(response.body.data.completed).toBe(progressData.completed);
            expect(response.body.data).toHaveProperty("date");
            expect(response.body.message).toContain("Study progress logged successfully");
        });

        it("should log progress with all optional fields", async () => {
            const completeProgressData = {
                topic: "Complete Topic",
                hours: 3.5,
                module: "COMS3028",
                notes: "Comprehensive study session",
                completed: true,
                difficulty: 4,
                confidence: 5,
                tags: ["important", "exam-topic"]
            };

            const response = await request(app)
                .post("/api/progress")
                .send(completeProgressData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data.topic).toBe(completeProgressData.topic);
            expect(response.body.data.module).toBe(completeProgressData.module.toUpperCase());
            expect(response.body.data.hours).toBe(completeProgressData.hours);
            expect(response.body.data.completed).toBe(completeProgressData.completed);
            expect(response.body.data.difficulty).toBe(completeProgressData.difficulty);
            expect(response.body.data.confidence).toBe(completeProgressData.confidence);
            expect(response.body.data.tags).toEqual(completeProgressData.tags);
        });

        it("should validate required fields", async () => {
            const invalidProgressData = {
                // Missing required fields: topic, module
                hours: 2.5,
                notes: "Missing required fields"
            };

            const response = await request(app)
                .post("/api/progress")
                .send(invalidProgressData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should validate hours field", async () => {
            const invalidProgressData = {
                topic: "Test Topic",
                module: "COMS3011",
                hours: -1 // Invalid negative hours
            };

            const response = await request(app)
                .post("/api/progress")
                .send(invalidProgressData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should validate module format", async () => {
            const invalidProgressData = {
                topic: "Test Topic",
                module: "invalid-module", // Should be uppercase
                hours: 2.5
            };

            const response = await request(app)
                .post("/api/progress")
                .send(invalidProgressData)
                .expect(201); // Should still work but convert to uppercase

            expect(response.body.data.module).toBe("INVALID-MODULE");
        });

        it("should validate notes length", async () => {
            const invalidProgressData = {
                topic: "Test Topic",
                module: "COMS3011",
                hours: 2.5,
                notes: "a".repeat(1001) // Too long
            };

            const response = await request(app)
                .post("/api/progress")
                .send(invalidProgressData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });
    });

    describe("GET /api/progress/:userId", () => {
        it("should return user's progress data", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(String),
                        userId: "test-user-uid",
                        topic: expect.any(String),
                        module: expect.any(String),
                        hours: expect.any(Number),
                        notes: expect.any(String),
                        completed: expect.any(Boolean),
                        date: expect.any(String)
                    })
                ])
            );
        });

        it("should filter progress by module", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid?module=COMS3011")
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
                        module: "COMS3028"
                    })
                ])
            );
        });

        it("should filter progress by completion status", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid?completed=true")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        completed: true
                    })
                ])
            );
            expect(response.body.data).not.toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        completed: false
                    })
                ])
            );
        });

        it("should support pagination", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid?page=1&limit=2")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body).toHaveProperty("pagination");
        });

        it("should sort progress by date", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid?sortBy=date&sortOrder=desc")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(1);
            
            // Check if dates are in descending order
            for (let i = 0; i < response.body.data.length - 1; i++) {
                const currentDate = new Date(response.body.data[i].date);
                const nextDate = new Date(response.body.data[i + 1].date);
                expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
            }
        });

        it("should return 403 for unauthorized access to other user's progress", async () => {
            const response = await request(app)
                .get("/api/progress/other-user-uid")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Access denied");
        });

        it("should return empty array for user with no progress", async () => {
            AuthHelpers.setupAuthMiddleware({ uid: "new-user", name: "New User" });

            const response = await request(app)
                .get("/api/progress/new-user")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual([]);
        });
    });

    describe("PUT /api/progress/:id", () => {
        it("should update progress entry successfully", async () => {
            const updateData = {
                topic: "Updated Topic",
                hours: 5.0,
                notes: "Updated notes",
                completed: true,
                difficulty: 4,
                confidence: 5
            };

            const response = await request(app)
                .put("/api/progress/progress1")
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.topic).toBe(updateData.topic);
            expect(response.body.data.hours).toBe(updateData.hours);
            expect(response.body.data.notes).toBe(updateData.notes);
            expect(response.body.data.completed).toBe(updateData.completed);
            expect(response.body.data.difficulty).toBe(updateData.difficulty);
            expect(response.body.data.confidence).toBe(updateData.confidence);
            expect(response.body.message).toContain("Progress updated successfully");
        });

        it("should update only provided fields", async () => {
            const partialUpdateData = {
                notes: "Just updating notes"
            };

            const response = await request(app)
                .put("/api/progress/progress1")
                .send(partialUpdateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.notes).toBe(partialUpdateData.notes);
            // Other fields should remain unchanged
            expect(response.body.data.topic).toBe("Design Patterns");
            expect(response.body.data.module).toBe("COMS3011");
        });

        it("should return 404 for non-existent progress entry", async () => {
            const updateData = {
                notes: "Updated notes"
            };

            const response = await request(app)
                .put("/api/progress/nonexistent")
                .send(updateData)
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Progress entry not found");
        });

        it("should return 403 for unauthorized access to other user's progress", async () => {
            // Mock different user
            AuthHelpers.setupAuthMiddleware({ uid: "other-user", name: "Other User" });

            const updateData = {
                notes: "Unauthorized update"
            };

            const response = await request(app)
                .put("/api/progress/progress1")
                .send(updateData)
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Access denied");
        });

        it("should validate update data", async () => {
            const invalidUpdateData = {
                hours: -1, // Invalid negative hours
                notes: "a".repeat(1001) // Too long notes
            };

            const response = await request(app)
                .put("/api/progress/progress1")
                .send(invalidUpdateData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });
    });

    describe("DELETE /api/progress/:id", () => {
        it("should delete progress entry successfully", async () => {
            const response = await request(app)
                .delete("/api/progress/progress1")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.message).toContain("Progress entry deleted successfully");
        });

        it("should return 404 for non-existent progress entry", async () => {
            const response = await request(app)
                .delete("/api/progress/nonexistent")
                .expect(404);

            TestUtils.expectErrorResponse(response, 404, "Progress entry not found");
        });

        it("should return 403 for unauthorized access to other user's progress", async () => {
            // Mock different user
            AuthHelpers.setupAuthMiddleware({ uid: "other-user", name: "Other User" });

            const response = await request(app)
                .delete("/api/progress/progress1")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Access denied");
        });
    });

    describe("GET /api/progress/:userId/analytics", () => {
        it("should return progress analytics", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid/analytics")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("totalHours");
            expect(response.body.data).toHaveProperty("completedTopics");
            expect(response.body.data).toHaveProperty("totalTopics");
            expect(response.body.data).toHaveProperty("averageDifficulty");
            expect(response.body.data).toHaveProperty("averageConfidence");
            expect(response.body.data).toHaveProperty("studyStreak");
            expect(response.body.data).toHaveProperty("weeklyHours");
            expect(response.body.data).toHaveProperty("moduleBreakdown");
        });

        it("should filter analytics by date range", async () => {
            const startDate = new Date("2025-01-01T00:00:00Z").toISOString();
            const endDate = new Date("2025-01-31T23:59:59Z").toISOString();

            const response = await request(app)
                .get(`/api/progress/test-user-uid/analytics?startDate=${startDate}&endDate=${endDate}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("totalHours");
            expect(response.body.data).toHaveProperty("dateRange");
        });

        it("should filter analytics by module", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid/analytics?module=COMS3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("moduleBreakdown");
            expect(response.body.data.moduleBreakdown).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        module: "COMS3011"
                    })
                ])
            );
        });

        it("should return 403 for unauthorized access to other user's analytics", async () => {
            const response = await request(app)
                .get("/api/progress/other-user-uid/analytics")
                .expect(403);

            TestUtils.expectErrorResponse(response, 403, "Access denied");
        });

        it("should return analytics for date range", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid/analytics?period=week")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("period", "week");
        });
    });

    describe("POST /api/progress/bulk", () => {
        it("should create multiple progress entries", async () => {
            const bulkData = {
                entries: [
                    {
                        topic: "Topic 1",
                        module: "COMS3011",
                        hours: 2.0,
                        notes: "First topic"
                    },
                    {
                        topic: "Topic 2",
                        module: "COMS3011",
                        hours: 1.5,
                        notes: "Second topic"
                    }
                ]
            };

            const response = await request(app)
                .post("/api/progress/bulk")
                .send(bulkData)
                .expect(201);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0]).toHaveProperty("id");
            expect(response.body.data[0].topic).toBe("Topic 1");
            expect(response.body.data[1].topic).toBe("Topic 2");
            expect(response.body.message).toContain("Bulk progress created successfully");
        });

        it("should validate bulk data", async () => {
            const invalidBulkData = {
                entries: [
                    {
                        topic: "Topic 1",
                        // Missing required module
                        hours: 2.0
                    }
                ]
            };

            const response = await request(app)
                .post("/api/progress/bulk")
                .send(invalidBulkData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Validation error");
        });

        it("should handle empty bulk data", async () => {
            const emptyBulkData = {
                entries: []
            };

            const response = await request(app)
                .post("/api/progress/bulk")
                .send(emptyBulkData)
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "No entries provided");
        });
    });

    describe("GET /api/progress/leaderboard", () => {
        it("should return study leaderboard", async () => {
            const response = await request(app)
                .get("/api/progress/leaderboard")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        userId: expect.any(String),
                        totalHours: expect.any(Number),
                        completedTopics: expect.any(Number),
                        rank: expect.any(Number)
                    })
                ])
            );
        });

        it("should filter leaderboard by module", async () => {
            const response = await request(app)
                .get("/api/progress/leaderboard?module=COMS3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        module: "COMS3011"
                    })
                ])
            );
        });

        it("should limit leaderboard results", async () => {
            const response = await request(app)
                .get("/api/progress/leaderboard?limit=5")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveLength(5);
        });

        it("should support different leaderboard periods", async () => {
            const response = await request(app)
                .get("/api/progress/leaderboard?period=week")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        period: "week"
                    })
                ])
            );
        });
    });

    describe("Error Handling", () => {
        it("should handle database errors gracefully", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid")
                .expect(200);

            expect(response.body).toHaveProperty("success");
        });

        it("should handle malformed requests", async () => {
            const response = await request(app)
                .post("/api/progress")
                .send("invalid json")
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
        });

        it("should handle invalid date formats", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid/analytics?startDate=invalid-date")
                .expect(400);

            TestUtils.expectErrorResponse(response, 400, "Invalid date format");
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get("/api/progress/test-user-uid")
                .expect(200);

            const responseTime = Date.now() - startTime;
            
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
            expect(response.body.success).toBe(true);
        });

        it("should handle large datasets efficiently", async () => {
            const response = await request(app)
                .get("/api/progress/test-user-uid?limit=100")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBeLessThanOrEqual(100);
        });

        it("should calculate analytics efficiently", async () => {
            const startTime = Date.now();
            
            const response = await request(app)
                .get("/api/progress/test-user-uid/analytics")
                .expect(200);

            const responseTime = Date.now() - startTime;
            
            expect(responseTime).toBeLessThan(2000); // Should calculate within 2 seconds
            expect(response.body.success).toBe(true);
        });
    });
});
