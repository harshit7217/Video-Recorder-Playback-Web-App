import express from "express";
import { createEmployer, postEmployer, getAllEmpolyers } from "../controllers/employerControllers.js";

const router = express.Router();

router.post("/", createEmployer);
router.post("/post", postEmployer);
router.get("/", getAllEmpolyers);

export default router;
