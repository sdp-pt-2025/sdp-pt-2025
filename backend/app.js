import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import userRoutes from "./routes/users.js";
import studyGroupRouter from "./routes/study-groups.js";
import chatRouter from "./routes/chats.js";
import dashboardRouter from "./routes/dashboard.js";
import profileRouter from "./routes/profile.js";
import FriendsRouter from "./routes/find-friends.js";
import uploadRouter from "./routes/uploads.js";
import weatherRouter from "./src/routes/weather.js";

const app = express();

// CORS Middleware - only define once
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? ["https://campus-study.vercel.app"] 
        : ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));

// Root endpoint
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
            "/api/find-friends",
            "/api/weather"
        ]
    });
});

// API Routes
app.use("/api/health", healthRouter);
app.use("/api/users", userRoutes);
app.use("/api/study-groups", studyGroupRouter);
app.use("/api/chats", chatRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/profile", profileRouter);
app.use("/api/find-friends", FriendsRouter);
app.use("/api/weather", weatherRouter);
app.use("/api", uploadRouter);

// 404 handler - must be last
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
            "/api/find-friends",
            "/api/weather"
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message
    });
});

export default app;