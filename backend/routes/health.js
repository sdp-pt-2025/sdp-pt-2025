import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
<<<<<<< HEAD
    res.status(200).send({ status: "ok" });
});

export default router;
=======
    res.status(200).send({ status: "ok running" });
});

export default router;
>>>>>>> clement-sg
