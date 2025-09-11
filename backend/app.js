import cors from "cors";
import userRoutes from "./routes/users.js";
import studyGroupRouter from "./routes/study-groups.js";



const app = express();


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