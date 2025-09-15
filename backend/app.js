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


const corsOptions = {
    origin: function (origin, callback) {
        
        if (!origin) return callback(null, true);
        
        const allowedOrigins = process.env.NODE_ENV === "production" 
            ? [
                "https://campus-study.vercel.app", 
                
                
            ] 
            : [
                "http://localhost:5173", 
                "http://localhost:5174",
                "http://localhost:3000",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
            ];
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'X-HTTP-Method-Override',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials'
    ],
    exposedHeaders: [
        'Content-Length',
        'X-Total-Count',
        'Authorization'
    ],
    optionsSuccessStatus: 200, 
    maxAge: 86400 
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Handle preflight
app.options('*', cors(corsOptions));

// Additional
app.use((req, res, next) => {

    // Additional CORS headers for compatibility
    const origin = req.headers.origin;
    const allowedOrigins = process.env.NODE_ENV === "production" 
        ? ["https://campus-study.vercel.app", "https://sdp-pt-2025-vqfu.vercel.app"]
        : ["http://localhost:5173", "http://localhost:5174", "http://localhost:3000"];
    
    if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
        res.header('Access-Control-Max-Age', '86400');
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log(`Preflight request from origin: ${origin}`);
        return res.status(200).end();
    }
    
    next();
});

// Body parsing middleware with increased limits
app.use(express.json({ 
    limit: "10mb",
    type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: "10mb" 
}));

// Request logging middleware (optional, for debugging)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
    next();
});

// Health check routes
app.use("/api/health2", healthRouter2);
app.use("/api/health", healthRouter);

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/study-groups", studyGroupRouter);
app.use("/api/chats", chatRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/profile", profileRouter);
app.use("/api/find-friends", FriendsRouter);

// Root endpoint
app.get("/", (req, res) => {
    res.json({ 
        message: "Backend server is running!",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        availableRoutes: [
            "/api/health",
            "/api/health2",
            "/api/users",
            "/api/study-groups",
            "/api/chats",
            "/api/dashboard",
            "/api/profile",
            "/api/find-friends"
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    if (error.message === 'Not allowed by CORS') {
        return res.status(403).json({
            error: 'CORS Error',
            message: 'Origin not allowed',
            origin: req.headers.origin
        });
    }
    
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method,
        availableRoutes: [
            "/",
            "/api/health",
            "/api/health2", 
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