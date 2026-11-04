import express from "express";
import {
  createCandidate,
  loginCandidate,
} from "../controllers/candidateControllers.js";

const router = express.Router();

router.post("/", createCandidate);
router.post("/login", loginCandidate);

export default router;
