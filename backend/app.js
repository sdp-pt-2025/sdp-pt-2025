import express from "express";
import healthRouter from "./routes/health.js";
import cors from "cors";
import userRoutes from "./routes/users.js";
import studyGroupRouter from "./routes/study-groups.js";
import healthRouter2 from "./src/routes/health.js";
import chatRouter from "./routes/chats.js";
import dashboardRouter from "./routes/dashboard.js";
import profileRouter from "./routes/profile.js";
import FriendsRouter from "./routes/find-friends.js";
import uploadRouter from "./routes/uploads.js";

const app = express();

// CORS Middleware - MUST BE FIRST (before routes)
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? ["https://campus-study.vercel.app"] 
        : ["http://localhost:5173", "http://localhost:5174"], // ✅ Fixed: removed trailing commas
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/health2", healthRouter2);
app.use("/api/health", healthRouter);
app.use("/api/users", userRoutes);
app.use("/api/study-groups", studyGroupRouter);
app.use("/api/chats", chatRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/profile", profileRouter);
app.use("/api/find-friends", FriendsRouter);
app.use("/api", uploadRouter);

app.get("/", (req, res) => {
    res.json({ 
        message: "Backend server is running!",
        timestamp: new Date().toISOString(),
        availableRoutes: [
            "/api/health",
            "/api/users",
            "/api/study-groups",
            "/api/chats",
            "/api/dashboard",
            "/api/profile",
            "/api/find-friends"
        ]
    });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        availableRoutes: [
            "/api/health",
            "/api/users",
            "/api/study-groups",
            "/api/chats",
            "/api/dashboard",
            "/api/profile",
            "/api/find-friends"
        ]
    });
});

export default app;