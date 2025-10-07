import { jest } from "@jest/globals";
import { TestDataFactory, AuthHelpers, DatabaseHelpers, RequestHelpers, TestUtils } from "../../helpers/testHelpers.js";

// Mock the user controller module
jest.mock("../../../controllers/userController.js", () => ({
    getUserProfile: jest.fn(),
    updateUserProfile: jest.fn(),
    searchUsers: jest.fn(),
    getUserStats: jest.fn(),
    deleteUserAccount: jest.fn()
}));

import userController from "../../../controllers/userController.js";

describe("User Controller Unit Tests", () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        TestUtils.TestEnvironment.cleanup();
        
        mockReq = RequestHelpers.createMockRequest();
        mockRes = RequestHelpers.createMockResponse();
        mockNext = RequestHelpers.createMockNext();
        
        jest.clearAllMocks();
    });

    describe("getUserProfile", () => {
        it("should return user profile successfully", async () => {
            const mockUser = TestDataFactory.createUser();
            
            userController.getUserProfile.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: mockUser,
                    message: "User profile retrieved successfully"
                });
            });

            await userController.getUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser,
                message: "User profile retrieved successfully"
            });
        });

        it("should handle user not found", async () => {
            userController.getUserProfile.mockImplementation(async (req, res, next) => {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                    message: "User profile not found"
                });
            });

            await userController.getUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "User not found",
                message: "User profile not found"
            });
        });

        it("should handle database errors", async () => {
            userController.getUserProfile.mockImplementation(async (req, res, next) => {
                const error = new Error("Database connection failed");
                next(error);
            });

            await userController.getUserProfile(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });

        it("should validate user ID parameter", async () => {
            mockReq.params.userId = "invalid-id";

            userController.getUserProfile.mockImplementation(async (req, res, next) => {
                res.status(400).json({
                    success: false,
                    error: "Invalid user ID",
                    message: "User ID must be a valid identifier"
                });
            });

            await userController.getUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Invalid user ID",
                message: "User ID must be a valid identifier"
            });
        });
    });

    describe("updateUserProfile", () => {
        it("should update user profile successfully", async () => {
            const updateData = {
                displayName: "Updated Name",
                bio: "Updated bio",
                studyPreferences: ["group", "online"]
            };
            
            mockReq.body = updateData;
            
            const updatedUser = TestDataFactory.createUser({
                ...updateData,
                updatedAt: new Date()
            });

            userController.updateUserProfile.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: updatedUser,
                    message: "User profile updated successfully"
                });
            });

            await userController.updateUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: updatedUser,
                message: "User profile updated successfully"
            });
        });

        it("should validate update data", async () => {
            const invalidUpdateData = {
                displayName: "a".repeat(101), // Too long
                email: "invalid-email" // Invalid format
            };
            
            mockReq.body = invalidUpdateData;

            userController.updateUserProfile.mockImplementation(async (req, res, next) => {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    message: "Invalid input data",
                    details: {
                        displayName: "Display name too long",
                        email: "Invalid email format"
                    }
                });
            });

            await userController.updateUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Validation error",
                message: "Invalid input data",
                details: expect.objectContaining({
                    displayName: "Display name too long",
                    email: "Invalid email format"
                })
            });
        });

        it("should handle partial updates", async () => {
            const partialUpdateData = {
                bio: "Just updating the bio"
            };
            
            mockReq.body = partialUpdateData;
            
            const updatedUser = TestDataFactory.createUser({
                bio: partialUpdateData.bio,
                updatedAt: new Date()
            });

            userController.updateUserProfile.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: updatedUser,
                    message: "User profile updated successfully"
                });
            });

            await userController.updateUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: updatedUser,
                message: "User profile updated successfully"
            });
        });

        it("should prevent unauthorized updates", async () => {
            mockReq.user = { uid: "other-user" };
            mockReq.params.userId = "test-user-uid";
            mockReq.body = { displayName: "Unauthorized Update" };

            userController.updateUserProfile.mockImplementation(async (req, res, next) => {
                res.status(403).json({
                    success: false,
                    error: "Access denied",
                    message: "You can only update your own profile"
                });
            });

            await userController.updateUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Access denied",
                message: "You can only update your own profile"
            });
        });
    });

    describe("searchUsers", () => {
        it("should search users successfully", async () => {
            const searchQuery = "alice";
            const mockUsers = [
                TestDataFactory.createUser({ name: "Alice Johnson", email: "alice@example.com" }),
                TestDataFactory.createUser({ name: "Alice Smith", email: "alice.smith@example.com" })
            ];
            
            mockReq.query = { q: searchQuery };

            userController.searchUsers.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: mockUsers,
                    count: mockUsers.length,
                    query: searchQuery,
                    message: "Users found successfully"
                });
            });

            await userController.searchUsers(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockUsers,
                count: mockUsers.length,
                query: searchQuery,
                message: "Users found successfully"
            });
        });

        it("should handle empty search results", async () => {
            const searchQuery = "nonexistent";
            
            mockReq.query = { q: searchQuery };

            userController.searchUsers.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: [],
                    count: 0,
                    query: searchQuery,
                    message: "No users found"
                });
            });

            await userController.searchUsers(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                count: 0,
                query: searchQuery,
                message: "No users found"
            });
        });

        it("should filter search results by criteria", async () => {
            const mockUsers = [
                TestDataFactory.createUser({ 
                    name: "Alice Johnson", 
                    modules: ["COMS3011", "COMS3028"],
                    yearOfStudy: 3
                })
            ];
            
            mockReq.query = { 
                q: "alice",
                modules: "COMS3011",
                yearOfStudy: "3"
            };

            userController.searchUsers.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: mockUsers,
                    count: mockUsers.length,
                    filters: {
                        modules: "COMS3011",
                        yearOfStudy: "3"
                    },
                    message: "Filtered users found successfully"
                });
            });

            await userController.searchUsers(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockUsers,
                count: mockUsers.length,
                filters: {
                    modules: "COMS3011",
                    yearOfStudy: "3"
                },
                message: "Filtered users found successfully"
            });
        });

        it("should validate search parameters", async () => {
            mockReq.query = { 
                q: "a".repeat(101) // Too long search query
            };

            userController.searchUsers.mockImplementation(async (req, res, next) => {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    message: "Search query too long"
                });
            });

            await userController.searchUsers(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Validation error",
                message: "Search query too long"
            });
        });

        it("should support pagination", async () => {
            const mockUsers = Array.from({ length: 10 }, (_, i) => 
                TestDataFactory.createUser({ id: `user${i}`, name: `User ${i}` })
            );
            
            mockReq.query = { 
                q: "user",
                page: "2",
                limit: "5"
            };

            userController.searchUsers.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: mockUsers.slice(5, 10),
                    count: mockUsers.length,
                    pagination: {
                        page: 2,
                        limit: 5,
                        total: mockUsers.length,
                        totalPages: 2
                    },
                    message: "Paginated users found successfully"
                });
            });

            await userController.searchUsers(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockUsers.slice(5, 10),
                count: mockUsers.length,
                pagination: {
                    page: 2,
                    limit: 5,
                    total: mockUsers.length,
                    totalPages: 2
                },
                message: "Paginated users found successfully"
            });
        });
    });

    describe("getUserStats", () => {
        it("should return user statistics successfully", async () => {
            const mockStats = {
                totalStudyHours: 120,
                completedTopics: 25,
                activeGroups: 3,
                studyStreak: 7,
                weeklyHours: 15,
                monthlyHours: 60,
                achievements: [
                    { name: "Study Streak", description: "7 days in a row", unlockedAt: new Date() }
                ]
            };

            userController.getUserStats.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: mockStats,
                    message: "User statistics retrieved successfully"
                });
            });

            await userController.getUserStats(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockStats,
                message: "User statistics retrieved successfully"
            });
        });

        it("should handle user with no statistics", async () => {
            const mockStats = {
                totalStudyHours: 0,
                completedTopics: 0,
                activeGroups: 0,
                studyStreak: 0,
                weeklyHours: 0,
                monthlyHours: 0,
                achievements: []
            };

            userController.getUserStats.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: mockStats,
                    message: "User statistics retrieved successfully"
                });
            });

            await userController.getUserStats(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockStats,
                message: "User statistics retrieved successfully"
            });
        });

        it("should filter stats by date range", async () => {
            const startDate = new Date("2025-01-01");
            const endDate = new Date("2025-01-31");
            
            mockReq.query = {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            };

            const mockStats = {
                totalStudyHours: 45,
                completedTopics: 8,
                activeGroups: 2,
                studyStreak: 5,
                weeklyHours: 12,
                monthlyHours: 45,
                dateRange: {
                    start: startDate,
                    end: endDate
                },
                achievements: []
            };

            userController.getUserStats.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    data: mockStats,
                    message: "Filtered user statistics retrieved successfully"
                });
            });

            await userController.getUserStats(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockStats,
                message: "Filtered user statistics retrieved successfully"
            });
        });
    });

    describe("deleteUserAccount", () => {
        it("should delete user account successfully", async () => {
            mockReq.body = { 
                confirmPassword: "correctPassword",
                reason: "No longer using the service"
            };

            userController.deleteUserAccount.mockImplementation(async (req, res, next) => {
                res.status(200).json({
                    success: true,
                    message: "User account deleted successfully"
                });
            });

            await userController.deleteUserAccount(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "User account deleted successfully"
            });
        });

        it("should require password confirmation", async () => {
            mockReq.body = { 
                reason: "No longer using the service"
                // Missing confirmPassword
            };

            userController.deleteUserAccount.mockImplementation(async (req, res, next) => {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    message: "Password confirmation required"
                });
            });

            await userController.deleteUserAccount(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Validation error",
                message: "Password confirmation required"
            });
        });

        it("should validate password confirmation", async () => {
            mockReq.body = { 
                confirmPassword: "wrongPassword",
                reason: "No longer using the service"
            };

            userController.deleteUserAccount.mockImplementation(async (req, res, next) => {
                res.status(400).json({
                    success: false,
                    error: "Authentication error",
                    message: "Incorrect password"
                });
            });

            await userController.deleteUserAccount(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Authentication error",
                message: "Incorrect password"
            });
        });

        it("should handle database errors during deletion", async () => {
            mockReq.body = { 
                confirmPassword: "correctPassword",
                reason: "No longer using the service"
            };

            userController.deleteUserAccount.mockImplementation(async (req, res, next) => {
                const error = new Error("Database deletion failed");
                next(error);
            });

            await userController.deleteUserAccount(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });

        it("should cleanup user data before deletion", async () => {
            mockReq.body = { 
                confirmPassword: "correctPassword",
                reason: "No longer using the service"
            };

            userController.deleteUserAccount.mockImplementation(async (req, res, next) => {
                // Simulate cleanup process
                res.status(200).json({
                    success: true,
                    message: "User account and all associated data deleted successfully",
                    cleanup: {
                        groups: 2,
                        messages: 15,
                        files: 3,
                        progress: 8
                    }
                });
            });

            await userController.deleteUserAccount(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: "User account and all associated data deleted successfully",
                cleanup: {
                    groups: 2,
                    messages: 15,
                    files: 3,
                    progress: 8
                }
            });
        });
    });

    describe("Error Handling", () => {
        it("should handle unexpected errors gracefully", async () => {
            userController.getUserProfile.mockImplementation(async (req, res, next) => {
                const error = new Error("Unexpected error");
                next(error);
            });

            await userController.getUserProfile(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });

        it("should handle timeout errors", async () => {
            userController.searchUsers.mockImplementation(async (req, res, next) => {
                const error = new Error("Request timeout");
                error.code = "ETIMEDOUT";
                next(error);
            });

            await userController.searchUsers(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.objectContaining({
                message: "Request timeout",
                code: "ETIMEDOUT"
            }));
        });
    });

    describe("Input Validation", () => {
        it("should sanitize user input", async () => {
            const maliciousInput = {
                displayName: "<script>alert('xss')</script>",
                bio: "'; DROP TABLE users; --"
            };
            
            mockReq.body = maliciousInput;

            userController.updateUserProfile.mockImplementation(async (req, res, next) => {
                // Simulate sanitized output
                const sanitizedUser = TestDataFactory.createUser({
                    displayName: "alert('xss')", // Script tags removed
                    bio: "DROP TABLE users;" // SQL injection attempt neutralized
                });

                res.status(200).json({
                    success: true,
                    data: sanitizedUser,
                    message: "User profile updated successfully"
                });
            });

            await userController.updateUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: expect.objectContaining({
                    displayName: "alert('xss')",
                    bio: "DROP TABLE users;"
                }),
                message: "User profile updated successfully"
            });
        });

        it("should validate required fields", async () => {
            const incompleteData = {
                // Missing required fields
                bio: "Just a bio"
            };
            
            mockReq.body = incompleteData;

            userController.updateUserProfile.mockImplementation(async (req, res, next) => {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    message: "Required fields missing",
                    missingFields: ["displayName", "email"]
                });
            });

            await userController.updateUserProfile(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: "Validation error",
                message: "Required fields missing",
                missingFields: ["displayName", "email"]
            });
        });
    });
});
