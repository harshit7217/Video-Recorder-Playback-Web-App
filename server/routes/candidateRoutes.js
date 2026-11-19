import express from "express";
import {
  createCandidate,
  loginCandidate,
  getCandidateDetails,
  checkCandidateInEmployerRadius,
  checkCandidateJobCountry,
  polygonController,
} from "../controllers/candidateControllers.js";

const router = express.Router();

router.post("/register", createCandidate);
router.post("/login", loginCandidate);
router.get("/details", getCandidateDetails);
router.post("/check-radius", checkCandidateInEmployerRadius);
router.post("/check-country", checkCandidateJobCountry);
router.get("/polygon", polygonController);

export default router;
