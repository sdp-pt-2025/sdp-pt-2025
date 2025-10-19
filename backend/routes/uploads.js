// routes/files.js - Combined upload and download router
import express from "express";
import multer from "multer";
import { adminStorage } from "../firebase/firebase-admin.js";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Get storage bucket
const bucketName = process.env.FIREBASE_STORAGE_BUCKET;
const bucket = adminStorage.bucket(bucketName);

// ========================================
// UPLOAD ENDPOINT
// ========================================
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // console.log("📤 Upload request received");
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No file provided" 
      });
    }

    const file = req.file;
    const timestamp = Date.now();
    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${timestamp}_${sanitizedFileName}`;
    
    // console.log("Using bucket:", bucketName);
    
    const fileRef = bucket.file(`Wireframe_To_Code/${fileName}`);

    // Upload file
    await fileRef.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          uploadedBy: req.body.email || "unknown",
          originalName: file.originalname,
        },
      },
    });

    // console.log("✅ File uploaded successfully");

    // Make file publicly accessible (optional - remove if you want private files)
    await fileRef.makePublic();

    // Get public download URL
    const downloadUrl = `https://storage.googleapis.com/${bucketName}/Wireframe_To_Code/${fileName}`;

    // console.log("Download URL:", downloadUrl);

    res.json({
      success: true,
      data: {
        url: downloadUrl,
        originalName: file.originalname,
        filename: file.originalname,
        fileName: fileName,
        storagePath: `Wireframe_To_Code/${fileName}`,
        size: file.size,
        type: file.mimetype,
      },
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Upload failed" 
    });
  }
});

// ========================================
// DOWNLOAD ENDPOINT (Secure with authorization)
// ========================================
router.post("/download-file", async (req, res) => {
  try {
    const { messageId, attachmentIndex = 0, userId } = req.body;

    if (!messageId || !userId) {
      return res.status(400).json({
        success: false,
        error: "Message ID and user ID are required"
      });
    }

    // console.log(`📥 Download request from user ${userId} for message ${messageId}`);

    // Get the message and verify user has access
    const message = await prisma.groupMessage.findUnique({
      where: { id: messageId },
      include: {
        group: {
          include: {
            members: {
              where: {
                userId: userId
              }
            }
          }
        }
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found"
      });
    }

    // Check if user is a member of the group
    if (message.group.members.length === 0) {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to access this file"
      });
    }

    // Get the attachment
    const attachments = message.attachments;
    if (!attachments || !attachments[attachmentIndex]) {
      return res.status(404).json({
        success: false,
        error: "Attachment not found"
      });
    }

    const attachment = attachments[attachmentIndex];
    const storagePath = attachment.storagePath;
    const fileName = attachment.filename || attachment.originalName || 'download';

    // console.log(`📥 Downloading file: ${storagePath}`);

    // Get file from Firebase Storage
    const file = bucket.file(storagePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: "File not found in storage"
      });
    }

    // Get file metadata
    const [metadata] = await file.getMetadata();
    
    // Set response headers for download
    res.setHeader('Content-Type', metadata.contentType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', metadata.size);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-cache');

    // console.log(`✅ Streaming file: ${fileName} (${metadata.size} bytes)`);

    // Stream the file to client
    file.createReadStream()
      .on('error', (error) => {
        console.error('❌ Stream error:', error);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: "Error streaming file"
          });
        }
      })
      .on('end', () => {
        // console.log(`✅ Download completed: ${fileName}`);
      })
      .pipe(res);

  } catch (error) {
    console.error("❌ Error downloading file:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to download file",
        message: process.env.NODE_ENV === "development" ? error.message : "Internal server error"
      });
    }
  }
});

export default router