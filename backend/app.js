import express from "express";
import healthRouter from "./routes/health.js";
import healthRouter2 from "./src/routes/health.js"

const app = express();

// Middleware
app.use(express.json());

// Endpoint handlers
app.use("/api/health", healthRouter);
app.use("/api/health2", healthRouter2);

export default app;