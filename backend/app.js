import express from "express";
import healthRouter from "./routes/health.js";

const app = express();

// Middleware
app.use(express.json());

// Endpoint handlers
app.use("/api/health", healthRouter);

export default app;