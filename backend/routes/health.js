import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).send({ status: "ok running" });
});

export default router;import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.status(200).send({ status: "ok" });
});

export default router;
