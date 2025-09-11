import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import { bucket } from "../firebase/config.js";
import { body, validationResult } from "express-validator";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Initialize Firebase Storage
//const bucket = admin.storage().bucket();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = (
            process.env.ALLOWED_FILE_TYPES || "application/pdf"
        ).split(",");
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(
                new Error(
                    `File type ${file.mimetype} not allowed. Only PDF files are permitted.`,
                ),
                false,
            );
        }
    },
});

/**
 * Upload a PDF file to Firebase Storage
 * POST /api/files/upload
 */
router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No file provided",
                message: "Please select a PDF file to upload",
            });
        }

        const { originalname, buffer, mimetype, size } = req.file;
        const userId = req.user.uid;

        // Generate unique filename
        const fileExtension = path.extname(originalname);
        const fileName = `${uuidv4()}${fileExtension}`;
        const filePath = `coursework/${userId}/${fileName}`;

        // Upload to Firebase Storage
        const file = bucket.file(filePath);
        const stream = file.createWriteStream({
            metadata: {
                contentType: mimetype,
                metadata: {
                    originalName: originalname,
                    uploadedBy: userId,
                    uploadedAt: new Date().toISOString(),
                },
            },
        });

        stream.on("error", (error) => {
            console.error("Upload error:", error);
            res.status(500).json({
                error: "Upload failed",
                message: "Failed to upload file to storage",
            });
        });

        stream.on("finish", async () => {
            try {
                // Make file publicly accessible
                await file.makePublic();

                // Get download URL
                const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

                // Save file metadata to Firestore
                const fileMetadata = {
                    id: uuidv4(),
                    fileName: originalname,
                    storagePath: filePath,
                    downloadUrl,
                    uploadedBy: userId,
                    uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
                    fileSize: size,
                    mimeType: mimetype,
                    isPublic: true,
                    tags: [],
                    description: "",
                    courseCode: "",
                    topic: "",
                };

                const docRef = await admin
                    .firestore()
                    .collection("coursework_files")
                    .add(fileMetadata);

                res.status(201).json({
                    success: true,
                    file: {
                        id: docRef.id,
                        ...fileMetadata,
                        uploadedAt: new Date().toISOString(),
                    },
                    message: "File uploaded successfully",
                });
            } catch (error) {
                console.error("Metadata save error:", error);
                res.status(500).json({
                    error: "Metadata save failed",
                    message: "File uploaded but metadata could not be saved",
                });
            }
        });

        stream.end(buffer);
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            error: "Upload failed",
            message: error.message,
        });
    }
});

/**
 * Get list of user's uploaded files
 * GET /api/files
 */
router.get("/", async (req, res) => {
    try {
        const userId = req.user.uid;
        const { courseCode, topic, limit = 50, offset = 0 } = req.query;

        let query = admin
            .firestore()
            .collection("coursework_files")
            .where("uploadedBy", "==", userId)
            .orderBy("uploadedAt", "desc")
            .limit(parseInt(limit))
            .offset(parseInt(offset));

        // Apply filters
        if (courseCode) {
            query = query.where("courseCode", "==", courseCode);
        }
        if (topic) {
            query = query.where("topic", "==", topic);
        }

        const snapshot = await query.get();
        const files = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            uploadedAt:
                doc.data().uploadedAt?.toDate?.()?.toISOString() || null,
        }));

        res.json({
            files,
            total: files.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error("Get files error:", error);
        res.status(500).json({
            error: "Failed to retrieve files",
            message: error.message,
        });
    }
});

/**
 * Get file metadata by ID
 * GET /api/files/:id
 */
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const doc = await admin
            .firestore()
            .collection("coursework_files")
            .doc(id)
            .get();

        if (!doc.exists) {
            return res.status(404).json({
                error: "File not found",
                message: "The requested file does not exist",
            });
        }

        const fileData = doc.data();

        // Check if user has access to this file
        if (fileData.uploadedBy !== userId) {
            return res.status(403).json({
                error: "Access denied",
                message: "You do not have permission to access this file",
            });
        }

        res.json({
            id: doc.id,
            ...fileData,
            uploadedAt: fileData.uploadedAt?.toDate?.()?.toISOString() || null,
        });
    } catch (error) {
        console.error("Get file error:", error);
        res.status(500).json({
            error: "Failed to retrieve file",
            message: error.message,
        });
    }
});

/**
 * Update file metadata
 * PUT /api/files/:id
 */
router.put(
    "/:id",
    [
        body("description").optional().isString().isLength({ max: 500 }),
        body("courseCode").optional().isString().isLength({ max: 20 }),
        body("topic").optional().isString().isLength({ max: 100 }),
        body("tags").optional().isArray(),
        body("tags.*").optional().isString().isLength({ max: 50 }),
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: "Validation error",
                    details: errors.array(),
                });
            }

            const { id } = req.params;
            const userId = req.user.uid;
            const { description, courseCode, topic, tags } = req.body;

            const docRef = admin
                .firestore()
                .collection("coursework_files")
                .doc(id);

            const doc = await docRef.get();

            if (!doc.exists) {
                return res.status(404).json({
                    error: "File not found",
                    message: "The requested file does not exist",
                });
            }

            const fileData = doc.data();

            // Check if user has access to this file
            if (fileData.uploadedBy !== userId) {
                return res.status(403).json({
                    error: "Access denied",
                    message: "You do not have permission to modify this file",
                });
            }

            // Update metadata
            const updateData = {
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            if (description !== undefined) updateData.description = description;
            if (courseCode !== undefined) updateData.courseCode = courseCode;
            if (topic !== undefined) updateData.topic = topic;
            if (tags !== undefined) updateData.tags = tags;

            await docRef.update(updateData);

            // Get updated document
            const updatedDoc = await docRef.get();
            const updatedData = updatedDoc.data();

            res.json({
                id: updatedDoc.id,
                ...updatedData,
                uploadedAt:
                    updatedData.uploadedAt?.toDate?.()?.toISOString() || null,
                updatedAt:
                    updatedData.updatedAt?.toDate?.()?.toISOString() || null,
            });
        } catch (error) {
            console.error("Update file error:", error);
            res.status(500).json({
                error: "Failed to update file",
                message: error.message,
            });
        }
    },
);

/**
 * Delete a file
 * DELETE /api/files/:id
 */
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const docRef = admin.firestore().collection("coursework_files").doc(id);

        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({
                error: "File not found",
                message: "The requested file does not exist",
            });
        }

        const fileData = doc.data();

        // Check if user has access to this file
        if (fileData.uploadedBy !== userId) {
            return res.status(403).json({
                error: "Access denied",
                message: "You do not have permission to delete this file",
            });
        }

        // Delete from Firebase Storage
        try {
            const file = bucket.file(fileData.storagePath);
            await file.delete();
        } catch (storageError) {
            console.error("Storage deletion error:", storageError);
            // Continue with Firestore deletion even if storage deletion fails
        }

        // Delete from Firestore
        await docRef.delete();

        res.json({
            success: true,
            message: "File deleted successfully",
        });
    } catch (error) {
        console.error("Delete file error:", error);
        res.status(500).json({
            error: "Failed to delete file",
            message: error.message,
        });
    }
});

/**
 * Download a file
 * GET /api/files/:id/download
 */
router.get("/:id/download", async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.uid;

        const doc = await admin
            .firestore()
            .collection("coursework_files")
            .doc(id)
            .get();

        if (!doc.exists) {
            return res.status(404).json({
                error: "File not found",
                message: "The requested file does not exist",
            });
        }

        const fileData = doc.data();

        // Check if user has access to this file
        if (fileData.uploadedBy !== userId) {
            return res.status(403).json({
                error: "Access denied",
                message: "You do not have permission to download this file",
            });
        }

        // Redirect to the download URL
        res.redirect(fileData.downloadUrl);
    } catch (error) {
        console.error("Download file error:", error);
        res.status(500).json({
            error: "Failed to download file",
            message: error.message,
        });
    }
});

/**
 * Search files
 * GET /api/files/search
 */
router.get("/search", async (req, res) => {
    try {
        const userId = req.user.uid;
        const { q, courseCode, topic, tags, limit = 20 } = req.query;

        let query = admin
            .firestore()
            .collection("coursework_files")
            .where("uploadedBy", "==", userId);

        // Apply filters
        if (courseCode) {
            query = query.where("courseCode", "==", courseCode);
        }
        if (topic) {
            query = query.where("topic", "==", topic);
        }

        const snapshot = await query.get();
        let files = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            uploadedAt:
                doc.data().uploadedAt?.toDate?.()?.toISOString() || null,
        }));

        // Apply text search if query provided
        if (q) {
            const searchTerm = q.toLowerCase();
            files = files.filter(
                (file) =>
                    file.fileName.toLowerCase().includes(searchTerm) ||
                    file.description.toLowerCase().includes(searchTerm) ||
                    file.courseCode.toLowerCase().includes(searchTerm) ||
                    file.topic.toLowerCase().includes(searchTerm) ||
                    file.tags.some((tag) =>
                        tag.toLowerCase().includes(searchTerm),
                    ),
            );
        }

        // Apply tag filter
        if (tags) {
            const tagArray = tags.split(",");
            files = files.filter((file) =>
                tagArray.some((tag) => file.tags.includes(tag.trim())),
            );
        }

        // Sort by upload date and limit results
        files = files
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
            .slice(0, parseInt(limit));

        res.json({
            files,
            total: files.length,
            query: q,
            filters: { courseCode, topic, tags },
        });
    } catch (error) {
        console.error("Search files error:", error);
        res.status(500).json({
            error: "Failed to search files",
            message: error.message,
        });
    }
});

export default router;
