import express from "express";
import {
  createCandidate,
  loginCandidate,
  getCandidateDetails,
  checkCandidateInEmployerRadius,
} from "../controllers/candidateControllers.js";

const router = express.Router();

router.post("/register", createCandidate);
router.post("/login", loginCandidate);
router.get("/details", getCandidateDetails);
router.post("/check-radius", checkCandidateInEmployerRadius);

export default router;
