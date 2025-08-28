import express, { Application } from "express";
import healthRouter from "./routes/health.js";

const app: Application = express();

// Middleware
app.use(express.json());

// Endpoint handlers
app.use("/api/health", healthRouter);

export default app;
