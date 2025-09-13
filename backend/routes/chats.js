// backend/routes/chats.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/chats";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow documents, images, and common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|ppt|pptx|xls|xlsx|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

// Create or get existing chat between two users
router.post("/", async (req, res) => {
  try {
    const { participant1Id, participant2Id } = req.body;

    if (!participant1Id || !participant2Id) {
      return res.status(400).json({
        success: false,
        error: "Both participant IDs are required",
      });
    }

    if (participant1Id === participant2Id) {
      return res.status(400).json({
        success: false,
        error: "Cannot create chat with yourself",
      });
    }

    // Check if chat already exists
    let existingChat = await prisma.chat.findFirst({
      where: {
        OR: [
          {
            AND: [
              { participant1Id: participant1Id },
              { participant2Id: participant2Id },
            ],
          },
          {
            AND: [
              { participant1Id: participant2Id },
              { participant2Id: participant1Id },
            ],
          },
        ],
      },
      include: {
        participant1: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
          },
        },
        participant2: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    if (existingChat) {
      return res.status(200).json({
        success: true,
        message: "Chat already exists",
        data: existingChat,
      });
    }

    // Create new chat
    const newChat = await prisma.chat.create({
      data: {
        participant1Id,
        participant2Id,
      },
      include: {
        participant1: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
          },
        },
        participant2: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Chat created successfully",
      data: newChat,
    });
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create chat",
    });
  }
});

// Get all chats for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const chats = await prisma.chat.findMany({
      where: {
        OR: [{ participant1Id: userId }, { participant2Id: userId }],
      },
      include: {
        participant1: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
        participant2: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
          select: {
            id: true,
            content: true,
            messageType: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                isRead: false,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip,
      take: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: chats,
    });
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chats",
    });
  }
});

// Get specific chat by ID
router.get("/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId } = req.query;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participant1: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
        participant2: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
            isActive: true,
            lastLoginAt: true,
          },
        },
      },
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    // Verify user is participant in this chat
    if (chat.participant1Id !== userId && chat.participant2Id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: chat,
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat",
    });
  }
});

// Get messages for a specific chat
router.get("/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { userId, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify user is participant in this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        participant1Id: true,
        participant2Id: true,
      },
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    if (chat.participant1Id !== userId && chat.participant2Id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: parseInt(limit),
    });

    // Mark messages as read for the requesting user
    await prisma.chatMessage.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      data: messages.reverse(), // Return in chronological order
    });
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch messages",
    });
  }
});

// Send a message
router.post("/:chatId/messages", upload.array("attachments", 5), async (req, res) => {
  try {
    const { chatId } = req.params;
    const { senderId, content, messageType = "text", replyToId } = req.body;

    // Verify user is participant in this chat
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: {
        participant1Id: true,
        participant2Id: true,
      },
    });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: "Chat not found",
      });
    }

    if (chat.participant1Id !== senderId && chat.participant2Id !== senderId) {
      return res.status(403).json({
        success: false,
        error: "Access denied",
      });
    }

    // Process file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileType: getFileType(file.mimetype),
      }));
    }

    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        chatId,
        senderId,
        content: content || "",
        messageType,
        attachments: attachments,
        replyToId: replyToId || null,
      },
      include: {
        sender: {
          select: {
            uid: true,
            displayName: true,
            photoURL: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                uid: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Update chat's last activity
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send message",
    });
  }
});

// Delete a message
router.delete("/messages/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;

    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      select: {
        senderId: true,
        attachments: true,
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found",
      });
    }

    // Only sender can delete their message
    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own messages",
      });
    }

    // Delete associated files
    if (message.attachments && message.attachments.length > 0) {
      message.attachments.forEach((attachment) => {
        try {
          if (fs.existsSync(attachment.filePath)) {
            fs.unlinkSync(attachment.filePath);
          }
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      });
    }

    await prisma.chatMessage.delete({
      where: { id: messageId },
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete message",
    });
  }
});

// Helper function to determine file type
function getFileType(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("audio/")) return "audio";
  if (mimeType.includes("pdf")) return "pdf";
  if (mimeType.includes("word") || mimeType.includes("document")) return "document";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "spreadsheet";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "presentation";
  return "file";
}

export default router;