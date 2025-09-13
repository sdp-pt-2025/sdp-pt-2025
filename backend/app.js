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



const app = express();
app.use("/api/health2", healthRouter2);


// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === "production" 
        ? ["https://campus-study.vercel.app", "https://sdp-pt-2025-vqfu.vercel.app"] 
        :  ["http://localhost:5173", "http://localhost:5174"], 
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));

// Endpoint handlers
app.use("/api/health", healthRouter);

//users
app.use("/api/users", userRoutes);

//study groups
app.use("/api/study-groups", studyGroupRouter);

//chat
app.use("/api/chats", chatRouter);

//dashboard
app.use("/api/dashboard", dashboardRouter);

//profile
app.use("/api/profile", profileRouter);

//find friends
app.use("/api/find-friends", FriendsRouter);

app.get("/", (req, res) => {
    res.json({ 
        message: "Backend server is running!",
        timestamp: new Date().toISOString(),
        availableRoutes: [
            "/api/health",
            "/api/users",
            "/api/study-groups"
        ]
    });
});
export default app;