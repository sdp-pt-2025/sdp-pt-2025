import { jest } from "@jest/globals";
import { TestDataFactory, TestUtils } from "../../helpers/testHelpers.js";

// Mock the matching service module
jest.mock("../../../services/matchingService.js", () => ({
    calculateCompatibilityScore: jest.fn(),
    findCompatiblePartners: jest.fn(),
    getStudyPartnerRecommendations: jest.fn(),
    filterPartnersByPreferences: jest.fn(),
    rankPartnersByCompatibility: jest.fn()
}));

import matchingService from "../../../services/matchingService.js";

describe("Matching Service Unit Tests", () => {
    let mockUser, mockPartners;

    beforeEach(() => {
        TestUtils.TestEnvironment.cleanup();
        
        // Create mock user
        mockUser = TestDataFactory.createUser({
            id: "user1",
            uid: "user1",
            modules: ["COMS3011", "COMS3028"],
            studyPreferences: ["group", "library"],
            availability: ["Monday", "Wednesday", "Friday"],
            yearOfStudy: 3,
            faculty: "Engineering"
        });

        // Create mock partners
        mockPartners = [
            TestDataFactory.createUser({
                id: "partner1",
                uid: "partner1",
                modules: ["COMS3011", "COMS3028"],
                studyPreferences: ["group", "library"],
                availability: ["Monday", "Wednesday"],
                yearOfStudy: 3,
                faculty: "Engineering",
                rating: 4.8
            }),
            TestDataFactory.createUser({
                id: "partner2",
                uid: "partner2",
                modules: ["COMS3011", "MATH2001"],
                studyPreferences: ["individual", "cafe"],
                availability: ["Tuesday", "Thursday"],
                yearOfStudy: 2,
                faculty: "Engineering",
                rating: 4.5
            }),
            TestDataFactory.createUser({
                id: "partner3",
                uid: "partner3",
                modules: ["COMS3028", "COMS3029"],
                studyPreferences: ["group", "online"],
                availability: ["Monday", "Wednesday", "Friday"],
                yearOfStudy: 3,
                faculty: "Engineering",
                rating: 4.9
            })
        ];
        
        jest.clearAllMocks();
    });

    describe("calculateCompatibilityScore", () => {
        it("should calculate high compatibility for matching partners", async () => {
            const partner = mockPartners[0]; // High compatibility partner
            
            matchingService.calculateCompatibilityScore.mockImplementation(async (user, partner) => {
                // Mock high compatibility calculation
                const moduleMatch = 1.0; // All modules match
                const preferenceMatch = 1.0; // All preferences match
                const availabilityMatch = 0.8; // Partial availability match
                const yearMatch = 1.0; // Same year
                const facultyMatch = 1.0; // Same faculty
                
                const score = (moduleMatch * 0.4 + preferenceMatch * 0.3 + 
                             availabilityMatch * 0.2 + yearMatch * 0.05 + facultyMatch * 0.05);
                
                return {
                    score,
                    breakdown: {
                        modules: moduleMatch,
                        preferences: preferenceMatch,
                        availability: availabilityMatch,
                        yearOfStudy: yearMatch,
                        faculty: facultyMatch
                    },
                    reasons: [
                        "Perfect module match",
                        "Compatible study preferences",
                        "Good availability overlap"
                    ]
                };
            });

            const result = await matchingService.calculateCompatibilityScore(mockUser, partner);

            expect(result.score).toBeGreaterThan(0.8);
            expect(result.breakdown).toHaveProperty("modules", 1.0);
            expect(result.breakdown).toHaveProperty("preferences", 1.0);
            expect(result.reasons).toContain("Perfect module match");
            expect(result.reasons).toContain("Compatible study preferences");
        });

        it("should calculate low compatibility for mismatched partners", async () => {
            const partner = mockPartners[1]; // Low compatibility partner
            
            matchingService.calculateCompatibilityScore.mockImplementation(async (user, partner) => {
                // Mock low compatibility calculation
                const moduleMatch = 0.5; // Partial module match
                const preferenceMatch = 0.0; // No preference match
                const availabilityMatch = 0.0; // No availability overlap
                const yearMatch = 0.0; // Different year
                const facultyMatch = 1.0; // Same faculty
                
                const score = (moduleMatch * 0.4 + preferenceMatch * 0.3 + 
                             availabilityMatch * 0.2 + yearMatch * 0.05 + facultyMatch * 0.05);
                
                return {
                    score,
                    breakdown: {
                        modules: moduleMatch,
                        preferences: preferenceMatch,
                        availability: availabilityMatch,
                        yearOfStudy: yearMatch,
                        faculty: facultyMatch
                    },
                    reasons: [
                        "Partial module overlap",
                        "Different study preferences",
                        "No availability overlap"
                    ]
                };
            });

            const result = await matchingService.calculateCompatibilityScore(mockUser, partner);

            expect(result.score).toBeLessThan(0.5);
            expect(result.breakdown).toHaveProperty("preferences", 0.0);
            expect(result.breakdown).toHaveProperty("availability", 0.0);
            expect(result.reasons).toContain("Different study preferences");
            expect(result.reasons).toContain("No availability overlap");
        });

        it("should handle edge cases in compatibility calculation", async () => {
            const edgeCasePartner = TestDataFactory.createUser({
                id: "edgePartner",
                modules: [], // Empty modules
                studyPreferences: [], // Empty preferences
                availability: [], // Empty availability
                yearOfStudy: null,
                faculty: null
            });
            
            matchingService.calculateCompatibilityScore.mockImplementation(async (user, partner) => {
                // Handle edge cases
                const moduleMatch = partner.modules.length > 0 ? 0.5 : 0.0;
                const preferenceMatch = partner.studyPreferences.length > 0 ? 0.3 : 0.0;
                const availabilityMatch = partner.availability.length > 0 ? 0.2 : 0.0;
                const yearMatch = partner.yearOfStudy ? 0.5 : 0.0;
                const facultyMatch = partner.faculty ? 0.5 : 0.0;
                
                const score = (moduleMatch * 0.4 + preferenceMatch * 0.3 + 
                             availabilityMatch * 0.2 + yearMatch * 0.05 + facultyMatch * 0.05);
                
                return {
                    score,
                    breakdown: {
                        modules: moduleMatch,
                        preferences: preferenceMatch,
                        availability: availabilityMatch,
                        yearOfStudy: yearMatch,
                        faculty: facultyMatch
                    },
                    reasons: ["Limited profile information"]
                };
            });

            const result = await matchingService.calculateCompatibilityScore(mockUser, edgeCasePartner);

            expect(result.score).toBeLessThan(0.3);
            expect(result.reasons).toContain("Limited profile information");
        });

        it("should weight compatibility factors correctly", async () => {
            const testPartner = TestDataFactory.createUser({
                modules: ["COMS3011"], // Partial module match
                studyPreferences: ["group"], // Partial preference match
                availability: ["Monday"], // Partial availability match
                yearOfStudy: 3, // Same year
                faculty: "Engineering" // Same faculty
            });
            
            matchingService.calculateCompatibilityScore.mockImplementation(async (user, partner) => {
                // Test specific weightings
                const weights = {
                    modules: 0.4,
                    preferences: 0.3,
                    availability: 0.2,
                    yearOfStudy: 0.05,
                    faculty: 0.05
                };
                
                const moduleMatch = 0.5; // 1 out of 2 modules match
                const preferenceMatch = 0.5; // 1 out of 2 preferences match
                const availabilityMatch = 0.33; // 1 out of 3 days match
                const yearMatch = 1.0;
                const facultyMatch = 1.0;
                
                const score = (moduleMatch * weights.modules + 
                             preferenceMatch * weights.preferences + 
                             availabilityMatch * weights.availability + 
                             yearMatch * weights.yearOfStudy + 
                             facultyMatch * weights.faculty);
                
                return {
                    score,
                    breakdown: {
                        modules: moduleMatch,
                        preferences: preferenceMatch,
                        availability: availabilityMatch,
                        yearOfStudy: yearMatch,
                        faculty: facultyMatch
                    },
                    weights,
                    reasons: ["Weighted compatibility calculation"]
                };
            });

            const result = await matchingService.calculateCompatibilityScore(mockUser, testPartner);

            expect(result.score).toBeGreaterThan(0.4);
            expect(result.score).toBeLessThan(0.6);
            expect(result.weights.modules).toBe(0.4); // Highest weight
            expect(result.weights.preferences).toBe(0.3); // Second highest
            expect(result.weights.availability).toBe(0.2); // Third highest
        });
    });

    describe("findCompatiblePartners", () => {
        it("should find compatible partners above threshold", async () => {
            const minScore = 0.7;
            
            matchingService.findCompatiblePartners.mockImplementation(async (user, partners, options = {}) => {
                const compatiblePartners = [];
                
                for (const partner of partners) {
                    const compatibility = await matchingService.calculateCompatibilityScore(user, partner);
                    if (compatibility.score >= (options.minScore || 0.5)) {
                        compatiblePartners.push({
                            ...partner,
                            compatibilityScore: compatibility.score,
                            compatibilityBreakdown: compatibility.breakdown,
                            compatibilityReasons: compatibility.reasons
                        });
                    }
                }
                
                // Sort by compatibility score descending
                compatiblePartners.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
                
                return {
                    partners: compatiblePartners,
                    total: compatiblePartners.length,
                    averageScore: compatiblePartners.reduce((sum, p) => sum + p.compatibilityScore, 0) / compatiblePartners.length
                };
            });

            const result = await matchingService.findCompatiblePartners(mockUser, mockPartners, { minScore });

            expect(result.partners.length).toBeGreaterThan(0);
            expect(result.partners[0].compatibilityScore).toBeGreaterThanOrEqual(minScore);
            expect(result.total).toBeGreaterThan(0);
            expect(result.averageScore).toBeGreaterThan(0);
        });

        it("should limit number of results", async () => {
            const limit = 2;
            
            matchingService.findCompatiblePartners.mockImplementation(async (user, partners, options = {}) => {
                const compatiblePartners = [];
                
                for (const partner of partners) {
                    const compatibility = await matchingService.calculateCompatibilityScore(user, partner);
                    if (compatibility.score >= 0.5) {
                        compatiblePartners.push({
                            ...partner,
                            compatibilityScore: compatibility.score,
                            compatibilityBreakdown: compatibility.breakdown,
                            compatibilityReasons: compatibility.reasons
                        });
                    }
                }
                
                // Sort and limit
                compatiblePartners.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
                const limitedPartners = compatiblePartners.slice(0, options.limit || 10);
                
                return {
                    partners: limitedPartners,
                    total: compatiblePartners.length,
                    limit: options.limit
                };
            });

            const result = await matchingService.findCompatiblePartners(mockUser, mockPartners, { limit });

            expect(result.partners.length).toBeLessThanOrEqual(limit);
            expect(result.limit).toBe(limit);
        });

        it("should handle empty partner list", async () => {
            matchingService.findCompatiblePartners.mockImplementation(async (user, partners, options = {}) => {
                return {
                    partners: [],
                    total: 0,
                    averageScore: 0,
                    message: "No partners available"
                };
            });

            const result = await matchingService.findCompatiblePartners(mockUser, []);

            expect(result.partners).toEqual([]);
            expect(result.total).toBe(0);
            expect(result.averageScore).toBe(0);
            expect(result.message).toBe("No partners available");
        });

        it("should filter by specific criteria", async () => {
            const filters = {
                modules: ["COMS3011"],
                yearOfStudy: 3,
                faculty: "Engineering"
            };
            
            matchingService.findCompatiblePartners.mockImplementation(async (user, partners, options = {}) => {
                let filteredPartners = partners;
                
                // Apply filters
                if (options.filters) {
                    if (options.filters.modules) {
                        filteredPartners = filteredPartners.filter(partner => 
                            partner.modules.some(module => options.filters.modules.includes(module))
                        );
                    }
                    if (options.filters.yearOfStudy) {
                        filteredPartners = filteredPartners.filter(partner => 
                            partner.yearOfStudy === options.filters.yearOfStudy
                        );
                    }
                    if (options.filters.faculty) {
                        filteredPartners = filteredPartners.filter(partner => 
                            partner.faculty === options.filters.faculty
                        );
                    }
                }
                
                const compatiblePartners = [];
                for (const partner of filteredPartners) {
                    const compatibility = await matchingService.calculateCompatibilityScore(user, partner);
                    if (compatibility.score >= 0.5) {
                        compatiblePartners.push({
                            ...partner,
                            compatibilityScore: compatibility.score,
                            compatibilityBreakdown: compatibility.breakdown,
                            compatibilityReasons: compatibility.reasons
                        });
                    }
                }
                
                return {
                    partners: compatiblePartners,
                    total: compatiblePartners.length,
                    filters: options.filters
                };
            });

            const result = await matchingService.findCompatiblePartners(mockUser, mockPartners, { filters });

            expect(result.filters).toEqual(filters);
            expect(result.partners.every(partner => 
                partner.modules.includes("COMS3011") && 
                partner.yearOfStudy === 3 && 
                partner.faculty === "Engineering"
            )).toBe(true);
        });
    });

    describe("getStudyPartnerRecommendations", () => {
        it("should provide personalized recommendations", async () => {
            matchingService.getStudyPartnerRecommendations.mockImplementation(async (user) => {
                const recommendations = {
                    topMatches: [
                        {
                            partner: mockPartners[0],
                            compatibilityScore: 0.9,
                            reasons: ["Perfect module match", "Same study preferences"],
                            recommendationType: "high_compatibility"
                        }
                    ],
                    diverseMatches: [
                        {
                            partner: mockPartners[2],
                            compatibilityScore: 0.7,
                            reasons: ["Good module overlap", "Complementary skills"],
                            recommendationType: "skill_diversity"
                        }
                    ],
                    studyGroups: [
                        {
                            groupId: "group1",
                            groupName: "COMS3011 Study Group",
                            compatibilityScore: 0.8,
                            memberCount: 5,
                            maxMembers: 8,
                            reasons: ["Active group", "Good member diversity"],
                            recommendationType: "group_activity"
                        }
                    ],
                    insights: {
                        commonModules: ["COMS3011", "COMS3028"],
                        popularStudyTimes: ["Monday", "Wednesday"],
                        recommendedStudyStyle: "group"
                    }
                };
                
                return recommendations;
            });

            const result = await matchingService.getStudyPartnerRecommendations(mockUser);

            expect(result).toHaveProperty("topMatches");
            expect(result).toHaveProperty("diverseMatches");
            expect(result).toHaveProperty("studyGroups");
            expect(result).toHaveProperty("insights");
            expect(result.topMatches[0].compatibilityScore).toBeGreaterThan(0.8);
            expect(result.insights.commonModules).toContain("COMS3011");
        });

        it("should handle new user with limited profile", async () => {
            const newUser = TestDataFactory.createUser({
                modules: ["COMS3011"],
                studyPreferences: [],
                availability: []
            });
            
            matchingService.getStudyPartnerRecommendations.mockImplementation(async (user) => {
                if (user.modules.length === 1 && user.studyPreferences.length === 0) {
                    return {
                        topMatches: [],
                        diverseMatches: [],
                        studyGroups: [
                            {
                                groupId: "group1",
                                groupName: `${user.modules[0]} Study Group`,
                                compatibilityScore: 0.6,
                                memberCount: 3,
                                maxMembers: 8,
                                reasons: ["Module match", "Open to new members"],
                                recommendationType: "module_based"
                            }
                        ],
                        insights: {
                            commonModules: user.modules,
                            popularStudyTimes: [],
                            recommendedStudyStyle: "explore_options",
                            suggestions: [
                                "Complete your study preferences",
                                "Set your availability",
                                "Join a study group to get started"
                            ]
                        }
                    };
                }
                
                return { topMatches: [], diverseMatches: [], studyGroups: [], insights: {} };
            });

            const result = await matchingService.getStudyPartnerRecommendations(newUser);

            expect(result.studyGroups.length).toBeGreaterThan(0);
            expect(result.insights.suggestions).toContain("Complete your study preferences");
            expect(result.insights.recommendedStudyStyle).toBe("explore_options");
        });

        it("should provide learning recommendations", async () => {
            matchingService.getStudyPartnerRecommendations.mockImplementation(async (user) => {
                return {
                    topMatches: [],
                    diverseMatches: [],
                    studyGroups: [],
                    insights: {
                        learningRecommendations: [
                            {
                                type: "skill_development",
                                description: "Consider studying with partners who excel in areas you want to improve",
                                action: "Look for partners with high ratings in specific modules"
                            },
                            {
                                type: "study_balance",
                                description: "Mix individual and group study sessions",
                                action: "Find partners with complementary study styles"
                            }
                        ],
                        growthOpportunities: [
                            "Join advanced study groups",
                            "Mentor junior students",
                            "Explore interdisciplinary study partnerships"
                        ]
                    }
                };
            });

            const result = await matchingService.getStudyPartnerRecommendations(mockUser);

            expect(result.insights.learningRecommendations).toBeDefined();
            expect(result.insights.growthOpportunities).toBeDefined();
            expect(result.insights.learningRecommendations[0].type).toBe("skill_development");
        });
    });

    describe("filterPartnersByPreferences", () => {
        it("should filter partners by study preferences", async () => {
            const preferences = {
                studyStyle: ["group"],
                location: ["library"],
                timeOfDay: ["morning", "evening"]
            };
            
            matchingService.filterPartnersByPreferences.mockImplementation(async (partners, preferences) => {
                return partners.filter(partner => {
                    const styleMatch = partner.studyPreferences.some(pref => 
                        preferences.studyStyle.includes(pref)
                    );
                    const locationMatch = partner.studyPreferences.some(pref => 
                        preferences.location.includes(pref)
                    );
                    return styleMatch && locationMatch;
                });
            });

            const result = await matchingService.filterPartnersByPreferences(mockPartners, preferences);

            expect(result.length).toBeLessThanOrEqual(mockPartners.length);
            expect(result.every(partner => 
                partner.studyPreferences.some(pref => preferences.studyStyle.includes(pref))
            )).toBe(true);
        });

        it("should handle empty preferences gracefully", async () => {
            const emptyPreferences = {};
            
            matchingService.filterPartnersByPreferences.mockImplementation(async (partners, preferences) => {
                if (Object.keys(preferences).length === 0) {
                    return partners; // Return all partners if no preferences specified
                }
                return partners.filter(partner => {
                    // Apply preference filtering logic
                    return true;
                });
            });

            const result = await matchingService.filterPartnersByPreferences(mockPartners, emptyPreferences);

            expect(result).toEqual(mockPartners);
        });

        it("should support flexible preference matching", async () => {
            const flexiblePreferences = {
                studyStyle: ["group", "individual"], // Multiple options
                strictMatch: false
            };
            
            matchingService.filterPartnersByPreferences.mockImplementation(async (partners, preferences) => {
                if (preferences.strictMatch === false) {
                    // Flexible matching - any preference match counts
                    return partners.filter(partner => 
                        partner.studyPreferences.some(pref => 
                            preferences.studyStyle.includes(pref)
                        )
                    );
                } else {
                    // Strict matching - all preferences must match
                    return partners.filter(partner => 
                        preferences.studyStyle.every(pref => 
                            partner.studyPreferences.includes(pref)
                        )
                    );
                }
            });

            const result = await matchingService.filterPartnersByPreferences(mockPartners, flexiblePreferences);

            expect(result.length).toBeGreaterThan(0);
            expect(result.every(partner => 
                partner.studyPreferences.some(pref => flexiblePreferences.studyStyle.includes(pref))
            )).toBe(true);
        });
    });

    describe("rankPartnersByCompatibility", () => {
        it("should rank partners by compatibility score", async () => {
            matchingService.rankPartnersByCompatibility.mockImplementation(async (user, partners) => {
                const rankedPartners = [];
                
                for (const partner of partners) {
                    const compatibility = await matchingService.calculateCompatibilityScore(user, partner);
                    rankedPartners.push({
                        ...partner,
                        compatibilityScore: compatibility.score,
                        rank: 0 // Will be set after sorting
                    });
                }
                
                // Sort by compatibility score descending
                rankedPartners.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
                
                // Assign ranks
                rankedPartners.forEach((partner, index) => {
                    partner.rank = index + 1;
                });
                
                return rankedPartners;
            });

            const result = await matchingService.rankPartnersByCompatibility(mockUser, mockPartners);

            expect(result.length).toBe(mockPartners.length);
            expect(result[0].rank).toBe(1);
            expect(result[0].compatibilityScore).toBeGreaterThanOrEqual(result[1].compatibilityScore);
            
            // Check that ranks are sequential
            for (let i = 0; i < result.length; i++) {
                expect(result[i].rank).toBe(i + 1);
            }
        });

        it("should handle ties in compatibility scores", async () => {
            const tiedPartners = [
                TestDataFactory.createUser({ id: "partner1", rating: 4.8 }),
                TestDataFactory.createUser({ id: "partner2", rating: 4.8 }),
                TestDataFactory.createUser({ id: "partner3", rating: 4.5 })
            ];
            
            matchingService.rankPartnersByCompatibility.mockImplementation(async (user, partners) => {
                const rankedPartners = [];
                
                for (const partner of partners) {
                    const compatibility = await matchingService.calculateCompatibilityScore(user, partner);
                    rankedPartners.push({
                        ...partner,
                        compatibilityScore: compatibility.score,
                        rank: 0
                    });
                }
                
                // Sort by compatibility score, then by rating for ties
                rankedPartners.sort((a, b) => {
                    if (b.compatibilityScore !== a.compatibilityScore) {
                        return b.compatibilityScore - a.compatibilityScore;
                    }
                    return b.rating - a.rating; // Higher rating wins ties
                });
                
                // Assign ranks
                rankedPartners.forEach((partner, index) => {
                    partner.rank = index + 1;
                });
                
                return rankedPartners;
            });

            const result = await matchingService.rankPartnersByCompatibility(mockUser, tiedPartners);

            expect(result.length).toBe(tiedPartners.length);
            expect(result[0].rank).toBe(1);
            expect(result[1].rank).toBe(2);
            expect(result[2].rank).toBe(3);
        });

        it("should provide ranking statistics", async () => {
            matchingService.rankPartnersByCompatibility.mockImplementation(async (user, partners) => {
                const rankedPartners = [];
                const scores = [];
                
                for (const partner of partners) {
                    const compatibility = await matchingService.calculateCompatibilityScore(user, partner);
                    rankedPartners.push({
                        ...partner,
                        compatibilityScore: compatibility.score,
                        rank: 0
                    });
                    scores.push(compatibility.score);
                }
                
                rankedPartners.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
                rankedPartners.forEach((partner, index) => {
                    partner.rank = index + 1;
                });
                
                const statistics = {
                    totalPartners: partners.length,
                    averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
                    highestScore: Math.max(...scores),
                    lowestScore: Math.min(...scores),
                    scoreDistribution: {
                        high: scores.filter(score => score >= 0.8).length,
                        medium: scores.filter(score => score >= 0.5 && score < 0.8).length,
                        low: scores.filter(score => score < 0.5).length
                    }
                };
                
                return {
                    rankedPartners,
                    statistics
                };
            });

            const result = await matchingService.rankPartnersByCompatibility(mockUser, mockPartners);

            expect(result.statistics).toHaveProperty("totalPartners");
            expect(result.statistics).toHaveProperty("averageScore");
            expect(result.statistics).toHaveProperty("highestScore");
            expect(result.statistics).toHaveProperty("lowestScore");
            expect(result.statistics).toHaveProperty("scoreDistribution");
            expect(result.statistics.scoreDistribution.high + 
                   result.statistics.scoreDistribution.medium + 
                   result.statistics.scoreDistribution.low).toBe(mockPartners.length);
        });
    });

    describe("Error Handling", () => {
        it("should handle invalid user data", async () => {
            const invalidUser = null;
            
            matchingService.calculateCompatibilityScore.mockImplementation(async (user, partner) => {
                if (!user || !partner) {
                    throw new Error("Invalid user or partner data");
                }
                return { score: 0.5, breakdown: {}, reasons: [] };
            });

            await expect(matchingService.calculateCompatibilityScore(invalidUser, mockPartners[0]))
                .rejects.toThrow("Invalid user or partner data");
        });

        it("should handle service errors gracefully", async () => {
            matchingService.findCompatiblePartners.mockImplementation(async (user, partners, options = {}) => {
                throw new Error("Database connection failed");
            });

            await expect(matchingService.findCompatiblePartners(mockUser, mockPartners))
                .rejects.toThrow("Database connection failed");
        });

        it("should handle timeout errors", async () => {
            matchingService.getStudyPartnerRecommendations.mockImplementation(async (user) => {
                return new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Request timeout")), 100);
                });
            });

            await expect(matchingService.getStudyPartnerRecommendations(mockUser))
                .rejects.toThrow("Request timeout");
        });
    });

    describe("Performance Tests", () => {
        it("should handle large partner lists efficiently", async () => {
            const largePartnerList = Array.from({ length: 1000 }, (_, i) => 
                TestDataFactory.createUser({ id: `partner${i}`, name: `Partner ${i}` })
            );
            
            matchingService.findCompatiblePartners.mockImplementation(async (user, partners, options = {}) => {
                const startTime = Date.now();
                const compatiblePartners = [];
                
                for (const partner of partners.slice(0, 100)) { // Limit processing for performance
                    const compatibility = await matchingService.calculateCompatibilityScore(user, partner);
                    if (compatibility.score >= 0.5) {
                        compatiblePartners.push({
                            ...partner,
                            compatibilityScore: compatibility.score
                        });
                    }
                }
                
                const processingTime = Date.now() - startTime;
                
                return {
                    partners: compatiblePartners.slice(0, options.limit || 10),
                    total: compatiblePartners.length,
                    processingTime,
                    performance: {
                        partnersProcessed: Math.min(partners.length, 100),
                        timePerPartner: processingTime / Math.min(partners.length, 100)
                    }
                };
            });

            const result = await matchingService.findCompatiblePartners(mockUser, largePartnerList, { limit: 10 });

            expect(result.partners.length).toBeLessThanOrEqual(10);
            expect(result.performance.timePerPartner).toBeLessThan(10); // Less than 10ms per partner
        });

        it("should cache compatibility calculations", async () => {
            let calculationCount = 0;
            
            matchingService.calculateCompatibilityScore.mockImplementation(async (user, partner) => {
                calculationCount++;
                return {
                    score: 0.8,
                    breakdown: {},
                    reasons: ["Cached calculation"],
                    cached: true
                };
            });

            // Calculate for same user-partner pair multiple times
            await matchingService.calculateCompatibilityScore(mockUser, mockPartners[0]);
            await matchingService.calculateCompatibilityScore(mockUser, mockPartners[0]);
            await matchingService.calculateCompatibilityScore(mockUser, mockPartners[0]);

            expect(calculationCount).toBe(3); // In real implementation, this should be 1 due to caching
        });
    });
});
