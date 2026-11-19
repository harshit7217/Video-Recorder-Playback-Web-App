import express from "express";
import {
  createCandidate,
  loginCandidate,
  getCandidateDetails,
  checkCandidateInEmployerRadius,
  polygonController,
} from "../controllers/candidateControllers.js";

const router = express.Router();

router.post("/register", createCandidate);
router.post("/login", loginCandidate);
router.get("/details", getCandidateDetails);
router.post("/check-radius", checkCandidateInEmployerRadius);
router.get("/polygon", polygonController);

export default router;
