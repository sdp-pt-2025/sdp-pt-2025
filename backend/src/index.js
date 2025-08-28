import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { verifyToken } from "./middleware/auth.js";
import healthRouter from "./routes/health.js";
import groupsRouter from "./routes/groups.js";
import partnersRouter from "./routes/partners.js";
import progressRouter from "./routes/progress.js";
import scheduleRouter from "./routes/schedule.js";

// Load environment variables
dotenv.config();

const app = express();

// Initialize Firebase Admin
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
  }
} else {
  console.log(
    '⚠️  Firebase Admin not initialized - no service account credentials found'
  );
  console.log(
    '📝 To enable Firebase Admin, set GOOGLE_APPLICATION_CREDENTIALS in your .env file'
  );
}

// Middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === 'production'
        ? ['https://campus-study.vercel.app']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Public endpoints (no authentication required)
app.use("/health", healthRouter);

// Protected API endpoints (authentication required)
app.use("/api/groups", verifyToken, groupsRouter);
app.use("/api/partners", verifyToken, partnersRouter);
app.use("/api/progress", verifyToken, progressRouter);
app.use("/api/schedule", verifyToken, scheduleRouter);

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    error: 'Internal server error',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
