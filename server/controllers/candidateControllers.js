import Candidate from "../models/candidateModel.js";
import Employer from "../models/employerModels.js";
import { isLocationWithinRadius } from "../services/checkRadiusOfCandidate.js";
import validator from "validator";

export const createCandidate = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!validator.isEmail(username)) {
      return res.status(400).json({ message: "Email is not valid" });
    }
    if (
      !validator.isStrongPassword(password, {
        minLenght: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
    ) {
      return res.status(400).json({
        message:
          "Password is not strong enough. Please ensure your password meets the minimum requirements: minimum length - 8, at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }
    const existingCandidate = await Candidate.findOne({ username });
    if (existingCandidate) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const candidate = new Candidate({ username, password });
    await candidate.save();
    res.status(201).json({ message: "Registration Successful" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const loginCandidate = async (req, res) => {
  try {
    const { username, password } = req.body;
    const candidate = await Candidate.findOne({ username });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", candidate });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getCandidateDetails = async (req, res) => {
  try {
    const username = req.query?.username ?? req.body?.username;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const candidate = await Candidate.findOne({ username });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "Candidate Details found", candidate });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const checkCandidateInEmployerRadius = async (req, res) => {
  try {
    const { lat, lng, employerId } = req.body;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({
        message: "Candidate location is not available",
      });
    }

    const employer = employerId
      ? await Employer.findById(employerId)
      : await Employer.findOne().sort({ createdAt: -1 });

    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    if (
      !Number.isFinite(employer.lat) ||
      !Number.isFinite(employer.lng) ||
      !Number.isFinite(employer.radius)
    ) {
      return res.status(400).json({
        message: "Employer location and radius are required",
      });
    }

    const result = isLocationWithinRadius({
      employerLat: employer.lat,
      employerLng: employer.lng,
      interviewLat: lat,
      interviewLng: lng,
      radiusInMeters: employer.radius,
    });

    return res.status(200).json({
      message: result.isWithinRadius
        ? "Candidate is within the employer radius"
        : "Candidate is outside the employer radius",
      isWithinRadius: result.isWithinRadius,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
