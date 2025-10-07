// backend/routes/users.js
import express from "express";
import { PrismaClient }  from "@prisma/client";
const router = express.Router();

const prisma = new PrismaClient();


router.post("/", async (req, res) => {
    try {
        const userData = req.body;

        // Validate required fields
        if (!userData.uid || !userData.email) {
            return res.status(400).json({ 
                error: "Missing required fields: uid and email are required" 
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { uid: userData.uid }
        });

        if (existingUser) {
            return res.status(409).json({ 
                error: "User already exists",
                user: existingUser 
            });
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName || "",
                photoURL: userData.photoURL || null,
                university: userData.university || "University of The Witwatersrand",
                studentId: userData.studentId || `user_${userData.uid.substring(0, 8)}`,
                yearOfStudy: userData.yearOfStudy || 1,
                faculty: userData.faculty || "Science",
                modules: userData.modules || ["COMS3011", "COMS3002", "COMS3007", "COMS3012"],
                fcmToken: userData.fcmToken || null,
                isActive: userData.isActive !== undefined ? userData.isActive : true,
                lastLoginAt: userData.lastLoginAt ? new Date(userData.lastLoginAt) : new Date(),
                createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date()
            }
        });

        res.status(201).json({ 
            message: "User created successfully", 
            user: newUser 
        });

    } catch (error) {
        console.error("Error creating user:", error);
    
        if (error.code === "P2002") {
            return res.status(409).json({ 
                error: "User with this email or UID already exists" 
            });
        }

        res.status(500).json({ 
            error: "Failed to create user",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

router.get("/:uid", async (req, res) => {
    try {
        const { uid } = req.params;

        const user = await prisma.user.findUnique({
            where: { uid: uid },
            select: {
                id: true,
                uid: true,
                email: true,
                displayName: true,
                photoURL: true,
                university: true,
                studentId: true,
                yearOfStudy: true,
                faculty: true,
                modules: true,
                isActive: true,
                lastLoginAt: true,
                createdAt: true,
                updatedAt: true,
                studyPreferences: true,
                availability: true
                
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);

    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ 
            error: "Failed to fetch user",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});


router.patch("/:uid", async (req, res) => {
    try {
        const { uid } = req.params;
        const updateData = req.body;

        
        delete updateData.uid;
        delete updateData.id;
        delete updateData.createdAt;

        const updatedUser = await prisma.user.update({
            where: { uid: uid },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });

        res.status(200).json({ 
            message: "User updated successfully", 
            user: updatedUser 
        });

    } catch (error) {
        console.error("Error updating user:", error);
    
        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(500).json({ 
            error: "Failed to update user",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});


router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = search ? {
            OR: [
                { email: { contains: search, mode: "insensitive" } },
                { displayName: { contains: search, mode: "insensitive" } },
                { studentId: { contains: search, mode: "insensitive" } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: parseInt(limit),
                select: {
                    id: true,
                    uid: true,
                    email: true,
                    displayName: true,
                    photoURL: true,
                    university: true,
                    studentId: true,
                    faculty: true,
                    isActive: true,
                    lastLoginAt: true,
                    createdAt: true
                },
                orderBy: { createdAt: "desc" }
            }),
            prisma.user.count({ where })
        ]);

        res.status(200).json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            error: "Failed to fetch users",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});


router.post("/:uid/migrate", async (req, res) => {
    try {
        const { uid } = req.params;
        const firebaseUserData = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { uid: uid }
        });

        if (existingUser) {
            // Update lastLoginAt
            const updatedUser = await prisma.user.update({
                where: { uid: uid },
                data: { lastLoginAt: new Date() }
            });
      
            return res.status(200).json({ 
                message: "User already exists, updated login time",
                user: updatedUser,
                migrated: false
            });
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                uid: uid,
                email: firebaseUserData.email,
                displayName: firebaseUserData.displayName || firebaseUserData.email?.split("@")[0] || "User",
                photoURL: firebaseUserData.photoURL || null,
                university: "University of The Witwatersrand",
                studentId: `user_${uid.substring(0, 8)}`,
                yearOfStudy: 1,
                faculty: "Unknown",
                modules: [],
                isActive: true,
                lastLoginAt: new Date()
            }
        });

        res.status(201).json({ 
            message: "User migrated successfully", 
            user: newUser,
            migrated: true
        });

    } catch (error) {
        console.error("Error migrating user:", error);
        res.status(500).json({ 
            error: "Failed to migrate user",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});


router.delete("/:uid", async (req, res) => {
    try {
        const { uid } = req.params;

        await prisma.user.delete({
            where: { uid: uid }
        });

        res.status(200).json({ message: "User deleted successfully" });

    } catch (error) {
        console.error("Error deleting user:", error);
    
        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(500).json({ 
            error: "Failed to delete user",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

export default router;