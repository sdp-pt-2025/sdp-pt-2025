import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

router.get("/", (req: Request, res: Response) => {
  res.json({ status: "OK", message: "Health check passed" });
});

export default router;
