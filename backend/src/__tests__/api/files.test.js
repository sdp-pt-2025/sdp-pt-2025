import request from "supertest";
import app from "../../index.js";
import admin from "firebase-admin";

// Mock the auth middleware
jest.mock("../../middleware/auth.js", () => ({
    verifyToken: (req, res, next) => {
        req.user = { uid: "test-user-id" };
        next();
    },
}));

// Mock multer
jest.mock("multer", () => {
    const multer = () => ({
        single: () => (req, res, next) => {
            req.file = {
                originalname: "test.pdf",
                buffer: Buffer.from("test file content"),
                mimetype: "application/pdf",
                size: 1024,
            };
            next();
        },
    });
    multer.memoryStorage = () => ({});
    return multer;
});

describe("Files API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("POST /api/files/upload", () => {
        it("should upload a PDF file successfully", async () => {
            const mockFile = {
                createWriteStream: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === "finish") {
                            setTimeout(callback, 0);
                        }
                    }),
                    end: jest.fn(),
                })),
                makePublic: jest.fn(),
            };

            const mockBucket = {
                file: jest.fn(() => mockFile),
            };

            admin.storage().bucket.mockReturnValue(mockBucket);

            const mockDocRef = {
                id: "test-file-id",
            };

            admin.firestore().collection().add.mockResolvedValue(mockDocRef);

            const response = await request(app)
                .post("/api/files/upload")
                .attach("file", Buffer.from("test content"), "test.pdf")
                .expect(201);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("file");
            expect(response.body.file).toHaveProperty("fileName", "test.pdf");
        });

        it("should reject non-PDF files", async () => {
            // Mock multer to return a non-PDF file
            jest.doMock("multer", () => {
                const multer = () => ({
                    single: () => (req, res, next) => {
                        req.file = {
                            originalname: "test.txt",
                            buffer: Buffer.from("test content"),
                            mimetype: "text/plain",
                            size: 1024,
                        };
                        next();
                    },
                });
                multer.memoryStorage = () => ({});
                return multer;
            });

            const response = await request(app)
                .post("/api/files/upload")
                .attach("file", Buffer.from("test content"), "test.txt")
                .expect(400);

            expect(response.body).toHaveProperty("error");
        });

        it("should handle upload errors gracefully", async () => {
            const mockFile = {
                createWriteStream: jest.fn(() => ({
                    on: jest.fn((event, callback) => {
                        if (event === "error") {
                            setTimeout(
                                () => callback(new Error("Upload failed")),
                                0,
                            );
                        }
                    }),
                    end: jest.fn(),
                })),
            };

            const mockBucket = {
                file: jest.fn(() => mockFile),
            };

            admin.storage().bucket.mockReturnValue(mockBucket);

            const response = await request(app)
                .post("/api/files/upload")
                .attach("file", Buffer.from("test content"), "test.pdf")
                .expect(500);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("Upload failed");
        });
    });

    describe("GET /api/files", () => {
        it("should return user files with pagination", async () => {
            const mockFiles = [
                {
                    id: "file1",
                    fileName: "test1.pdf",
                    uploadedBy: "test-user-id",
                    uploadedAt: { toDate: () => new Date() },
                },
                {
                    id: "file2",
                    fileName: "test2.pdf",
                    uploadedBy: "test-user-id",
                    uploadedAt: { toDate: () => new Date() },
                },
            ];

            const mockSnapshot = {
                docs: mockFiles.map((file) => ({
                    id: file.id,
                    data: () => file,
                })),
            };

            admin
                .firestore()
                .collection()
                .where()
                .orderBy()
                .limit()
                .offset()
                .get.mockResolvedValue(mockSnapshot);

            const response = await request(app)
                .get("/api/files?limit=10&offset=0")
                .expect(200);

            expect(response.body).toHaveProperty("files");
            expect(response.body.files).toHaveLength(2);
            expect(response.body).toHaveProperty("total", 2);
        });

        it("should filter files by course code", async () => {
            const mockFiles = [
                {
                    id: "file1",
                    fileName: "test1.pdf",
                    courseCode: "COMS3011",
                    uploadedBy: "test-user-id",
                },
            ];

            const mockSnapshot = {
                docs: mockFiles.map((file) => ({
                    id: file.id,
                    data: () => file,
                })),
            };

            admin
                .firestore()
                .collection()
                .where()
                .where()
                .orderBy()
                .limit()
                .offset()
                .get.mockResolvedValue(mockSnapshot);

            const response = await request(app)
                .get("/api/files?courseCode=COMS3011")
                .expect(200);

            expect(response.body).toHaveProperty("files");
            expect(response.body.files[0].courseCode).toBe("COMS3011");
        });
    });

    describe("GET /api/files/:id", () => {
        it("should return file metadata by ID", async () => {
            const mockFile = {
                id: "test-file-id",
                fileName: "test.pdf",
                uploadedBy: "test-user-id",
                uploadedAt: { toDate: () => new Date() },
            };

            const mockDoc = {
                exists: true,
                data: () => mockFile,
            };

            admin.firestore().collection().doc().get.mockResolvedValue(mockDoc);

            const response = await request(app)
                .get("/api/files/test-file-id")
                .expect(200);

            expect(response.body).toHaveProperty("id", "test-file-id");
            expect(response.body).toHaveProperty("fileName", "test.pdf");
        });

        it("should return 404 for non-existent file", async () => {
            const mockDoc = {
                exists: false,
            };

            admin.firestore().collection().doc().get.mockResolvedValue(mockDoc);

            const response = await request(app)
                .get("/api/files/non-existent-id")
                .expect(404);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("File not found");
        });

        it("should return 403 for unauthorized access", async () => {
            const mockFile = {
                id: "test-file-id",
                fileName: "test.pdf",
                uploadedBy: "other-user-id",
            };

            const mockDoc = {
                exists: true,
                data: () => mockFile,
            };

            admin.firestore().collection().doc().get.mockResolvedValue(mockDoc);

            const response = await request(app)
                .get("/api/files/test-file-id")
                .expect(403);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("Access denied");
        });
    });

    describe("PUT /api/files/:id", () => {
        it("should update file metadata", async () => {
            const mockFile = {
                id: "test-file-id",
                fileName: "test.pdf",
                uploadedBy: "test-user-id",
                description: "Old description",
            };

            const mockDoc = {
                exists: true,
                data: () => mockFile,
            };

            admin.firestore().collection().doc().get.mockResolvedValue(mockDoc);
            admin.firestore().collection().doc().update.mockResolvedValue();

            const updatedFile = {
                ...mockFile,
                description: "New description",
                updatedAt: { toDate: () => new Date() },
            };

            const mockUpdatedDoc = {
                id: "test-file-id",
                data: () => updatedFile,
            };

            admin
                .firestore()
                .collection()
                .doc()
                .get.mockResolvedValueOnce(mockDoc) // First call for permission check
                .mockResolvedValueOnce(mockUpdatedDoc); // Second call for updated data

            const response = await request(app)
                .put("/api/files/test-file-id")
                .send({ description: "New description" })
                .expect(200);

            expect(response.body).toHaveProperty(
                "description",
                "New description",
            );
        });

        it("should validate update data", async () => {
            const response = await request(app)
                .put("/api/files/test-file-id")
                .send({ description: "a".repeat(501) }) // Too long
                .expect(400);

            expect(response.body).toHaveProperty("error");
            expect(response.body.error).toBe("Validation error");
        });
    });

    describe("DELETE /api/files/:id", () => {
        it("should delete a file successfully", async () => {
            const mockFile = {
                id: "test-file-id",
                fileName: "test.pdf",
                uploadedBy: "test-user-id",
                storagePath: "coursework/test-user-id/test-file.pdf",
            };

            const mockDoc = {
                exists: true,
                data: () => mockFile,
            };

            const mockStorageFile = {
                delete: jest.fn(),
            };

            const mockBucket = {
                file: jest.fn(() => mockStorageFile),
            };

            admin.firestore().collection().doc().get.mockResolvedValue(mockDoc);
            admin.firestore().collection().doc().delete.mockResolvedValue();
            admin.storage().bucket.mockReturnValue(mockBucket);

            const response = await request(app)
                .delete("/api/files/test-file-id")
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(mockStorageFile.delete).toHaveBeenCalled();
        });
    });

    describe("GET /api/files/search", () => {
        it("should search files by query", async () => {
            const mockFiles = [
                {
                    id: "file1",
                    fileName: "assignment.pdf",
                    description: "Math assignment",
                    courseCode: "MATH101",
                    topic: "Calculus",
                    tags: ["homework", "math"],
                    uploadedBy: "test-user-id",
                },
            ];

            const mockSnapshot = {
                docs: mockFiles.map((file) => ({
                    id: file.id,
                    data: () => file,
                })),
            };

            admin
                .firestore()
                .collection()
                .where()
                .get.mockResolvedValue(mockSnapshot);

            const response = await request(app)
                .get("/api/files/search?q=assignment")
                .expect(200);

            expect(response.body).toHaveProperty("files");
            expect(response.body.files).toHaveLength(1);
            expect(response.body.files[0].fileName).toBe("assignment.pdf");
        });
    });
});
