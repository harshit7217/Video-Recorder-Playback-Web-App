import Candidate from "../models/candidateModel.js";
import Employer from "../models/employerModels.js";
import { isLocationWithinRadius } from "../services/checkRadiusOfCandidate.js";

export const createCandidate = async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingCandidate = await Candidate.findOne({ username });
    if (existingCandidate) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const candidate = new Candidate({ username, password });
    await candidate.save();
    res.status(201).json(candidate);
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

export const setLatLang = async (req, res) => {
  try {
    const { username, lat, lng, name } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const parsedLat = Number(lat);
    const parsedLng = Number(lng);

    if (!Number.isFinite(parsedLat) || !Number.isFinite(parsedLng)) {
      return res
        .status(400)
        .json({ message: "Latitude and longitude must be valid numbers" });
    }

    const candidate = await Candidate.findOneAndUpdate(
      { username },
      {
        latitude: parsedLat,
        longitude: parsedLng,
        ...(name ? { name } : {}),
      },
      { new: true },
    );

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.status(200).json({ message: "Updating successfully", candidate });
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
    const { username, employerId } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const candidate = await Candidate.findOne({ username });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (
      !Number.isFinite(candidate.latitude) ||
      !Number.isFinite(candidate.longitude)
    ) {
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
      interviewLat: candidate.latitude,
      interviewLng: candidate.longitude,
      radiusInMeters: employer.radius,
    });

    return res.status(200).json({
      message: result.isWithinRadius
        ? "Candidate is within the employer radius"
        : "Candidate is outside the employer radius",
      isWithinRadius: result.isWithinRadius,
      distanceInMeters: result.distanceInMeters,
      radiusInMeters: result.radiusInMeters,
      candidate: {
        username: candidate.username,
        latitude: candidate.latitude,
        longitude: candidate.longitude,
      },
      employer: {
        id: employer._id,
        name: employer.name,
        lat: employer.lat,
        lng: employer.lng,
        radius: employer.radius,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
