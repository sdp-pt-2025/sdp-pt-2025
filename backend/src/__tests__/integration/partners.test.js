import request from "supertest";
import express from "express";
import partnersRouter from "../../routes/partners.js";
import { TestDataFactory, AuthHelpers, AssertionHelpers } from "../helpers/testHelpers.js";

// Create test app
const app = express();
app.use(express.json());
app.use("/api/partners", partnersRouter);

describe("Partners API Integration Tests", () => {
    let testUser;

    beforeEach(() => {
        testUser = TestDataFactory.createUser();
        // Mock authentication middleware
        app.use((req, res, next) => {
            req.user = testUser;
            next();
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/partners", () => {
        it("should return all partners excluding the current user", async () => {
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("results");
            expect(response.body.data).toHaveProperty("page");
            expect(response.body.data).toHaveProperty("limit");
            expect(response.body.data).toHaveProperty("total");
            expect(response.body.data).toHaveProperty("totalPages");

            // Ensure current user is not included in results
            const currentUserInResults = response.body.data.results.some(
                (partner) => partner.id === testUser.uid
            );
            expect(currentUserInResults).toBe(false);
        });

        it("should filter partners by single module", async () => {
            const response = await request(app)
                .get("/api/partners?module=COMS3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        modules: expect.arrayContaining(["COMS3011"]),
                    }),
                ])
            );

            // All returned partners should have COMS3011
            response.body.data.results.forEach((partner) => {
                expect(partner.modules).toContain("COMS3011");
            });
        });

        it("should filter partners by multiple modules (any match)", async () => {
            const response = await request(app)
                .get("/api/partners?modules=COMS3011,COMS3028")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results.length).toBeGreaterThan(0);

            // All returned partners should have at least one of the specified modules
            response.body.data.results.forEach((partner) => {
                const hasMatchingModule = partner.modules.some((module) =>
                    ["COMS3011", "COMS3028"].includes(module)
                );
                expect(hasMatchingModule).toBe(true);
            });
        });

        it("should filter partners by multiple modules (all must match)", async () => {
            const response = await request(app)
                .get("/api/partners?modulesAll=COMS3011,COMS3028")
                .expect(200);

            expect(response.body.success).toBe(true);

            // All returned partners should have both specified modules
            response.body.data.results.forEach((partner) => {
                expect(partner.modules).toContain("COMS3011");
                expect(partner.modules).toContain("COMS3028");
            });
        });

        it("should exclude partners with specific modules", async () => {
            const response = await request(app)
                .get("/api/partners?notModule=MATH2001")
                .expect(200);

            expect(response.body.success).toBe(true);

            // No returned partners should have the excluded module
            response.body.data.results.forEach((partner) => {
                expect(partner.modules).not.toContain("MATH2001");
            });
        });

        it("should handle pagination correctly", async () => {
            const page = 1;
            const limit = 2;

            const response = await request(app)
                .get(`/api/partners?page=${page}&limit=${limit}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.page).toBe(page);
            expect(response.body.data.limit).toBe(limit);
            expect(response.body.data.results.length).toBeLessThanOrEqual(limit);
            expect(response.body.data.totalPages).toBeGreaterThan(0);
        });

        it("should handle empty results gracefully", async () => {
            // Create a user with a unique module that won't match any partners
            const uniqueUser = TestDataFactory.createUser({
                uid: "unique-user-uid",
                modules: ["UNIQUE999"],
            });

            app.use((req, res, next) => {
                req.user = uniqueUser;
                next();
            });

            const response = await request(app)
                .get("/api/partners?module=UNIQUE999")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual([]);
            expect(response.body.data.total).toBe(0);
            expect(response.body.data.totalPages).toBe(0);
        });

        it("should handle invalid pagination parameters", async () => {
            const response = await request(app)
                .get("/api/partners?page=invalid&limit=invalid")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.page).toBe(1); // Should default to 1
            expect(response.body.data.limit).toBe(10); // Should default to 10
        });

        it("should handle case-insensitive module filtering", async () => {
            const response = await request(app)
                .get("/api/partners?module=coms3011")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results.length).toBeGreaterThan(0);

            // All returned partners should have COMS3011 (uppercase)
            response.body.data.results.forEach((partner) => {
                expect(partner.modules).toContain("COMS3011");
            });
        });

        it("should handle multiple filter combinations", async () => {
            const response = await request(app)
                .get("/api/partners?module=COMS3011&notModule=MATH2001&page=1&limit=5")
                .expect(200);

            expect(response.body.success).toBe(true);

            // All returned partners should have COMS3011 but not MATH2001
            response.body.data.results.forEach((partner) => {
                expect(partner.modules).toContain("COMS3011");
                expect(partner.modules).not.toContain("MATH2001");
            });
        });

        it("should return partners with correct data structure", async () => {
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body.success).toBe(true);

            if (response.body.data.results.length > 0) {
                const partner = response.body.data.results[0];
                AssertionHelpers.assertUserProperties(partner);
                expect(partner).toHaveProperty("year");
                expect(partner).toHaveProperty("major");
                expect(partner).toHaveProperty("studyPreferences");
                expect(partner).toHaveProperty("availability");
                expect(partner).toHaveProperty("rating");
                expect(partner).toHaveProperty("totalStudyHours");
            }
        });
    });

    describe("Error Handling", () => {
        it("should handle server errors gracefully", async () => {
            // Mock a server error by temporarily breaking the route
            const originalRouter = partnersRouter;
            partnersRouter.get("/", (req, res) => {
                throw new Error("Simulated server error");
            });

            const response = await request(app)
                .get("/api/partners")
                .expect(500);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe("Failed to search study partners");
            expect(response.body.message).toBe("Simulated server error");

            // Restore original router
            partnersRouter.get("/", originalRouter.get("/"));
        });

        it("should handle malformed query parameters", async () => {
            const response = await request(app)
                .get("/api/partners?module=")
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should return all partners when module is empty
        });

        it("should handle very large pagination values", async () => {
            const response = await request(app)
                .get("/api/partners?page=999999&limit=999999")
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual([]);
            expect(response.body.data.totalPages).toBe(0);
        });
    });

    describe("Performance Tests", () => {
        it("should respond within acceptable time limits", async () => {
            const startTime = Date.now();

            await request(app)
                .get("/api/partners")
                .expect(200);

            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(1000); // Should respond within 1 second
        });

        it("should handle concurrent requests", async () => {
            const requests = Array.from({ length: 10 }, () =>
                request(app).get("/api/partners")
            );

            const responses = await Promise.all(requests);

            responses.forEach((response) => {
                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });
        });
    });

    describe("Data Validation", () => {
        it("should validate partner data structure", async () => {
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body.success).toBe(true);

            response.body.data.results.forEach((partner) => {
                // Validate required fields
                expect(partner.id).toBeDefined();
                expect(partner.name).toBeDefined();
                expect(partner.email).toBeDefined();
                expect(partner.modules).toBeDefined();
                expect(Array.isArray(partner.modules)).toBe(true);

                // Validate data types
                expect(typeof partner.id).toBe("string");
                expect(typeof partner.name).toBe("string");
                expect(typeof partner.email).toBe("string");
                expect(typeof partner.year).toBe("number");
                expect(typeof partner.rating).toBe("number");
                expect(typeof partner.totalStudyHours).toBe("number");

                // Validate ranges
                expect(partner.year).toBeGreaterThan(0);
                expect(partner.year).toBeLessThan(10);
                expect(partner.rating).toBeGreaterThanOrEqual(0);
                expect(partner.rating).toBeLessThanOrEqual(5);
                expect(partner.totalStudyHours).toBeGreaterThanOrEqual(0);
            });
        });

        it("should ensure email format validation", async () => {
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body.success).toBe(true);

            response.body.data.results.forEach((partner) => {
                expect(partner.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
            });
        });

        it("should ensure module codes are uppercase", async () => {
            const response = await request(app)
                .get("/api/partners")
                .expect(200);

            expect(response.body.success).toBe(true);

            response.body.data.results.forEach((partner) => {
                partner.modules.forEach((module) => {
                    expect(module).toBe(module.toUpperCase());
                });
            });
        });
    });

    describe("Edge Cases", () => {
        it("should handle special characters in module names", async () => {
            const response = await request(app)
                .get("/api/partners?module=COMS3011,COMS3028")
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should not crash or return errors
        });

        it("should handle very long module lists", async () => {
            const longModuleList = Array.from({ length: 100 }, (_, i) => `MODULE${i}`).join(",");
            
            const response = await request(app)
                .get(`/api/partners?modules=${longModuleList}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.results).toEqual([]);
        });

        it("should handle whitespace in module parameters", async () => {
            const response = await request(app)
                .get("/api/partners?module= COMS3011 , COMS3028 ")
                .expect(200);

            expect(response.body.success).toBe(true);
            // Should trim whitespace and work correctly
        });
    });
});
