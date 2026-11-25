import mongoose from "mongoose";
import Candidate from "../models/candidateModel.js";
import Employer from "../models/employerModels.js";
import EmployerPolygon from "../models/employerPolygonModel.js";
import { isLocationWithinRadius } from "../services/checkRadiusOfCandidate.js";
import validator from "validator";
import { boundaryofPolygons, isInside } from "../services/polygonService.js";

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
    const { lat, lng, ipLat, ipLng, employerId } = req.body;
    const hasIpLocation = ipLat !== undefined || ipLng !== undefined;

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      (hasIpLocation && (!Number.isFinite(ipLat) || !Number.isFinite(ipLng)))
    ) {
      return res.status(400).json({
        message: "Candidate location is not available",
      });
    }

    const employerLocations = employerId
      ? await Employer.find({
          employerId: new mongoose.Types.ObjectId(employerId),
        }).sort({ createdAt: -1 })
      : await Employer.find().sort({ createdAt: -1 });

    if (!employerLocations.length) {
      return res.status(404).json({ message: "Employer location not found" });
    }

    const matchingLocations = employerLocations.filter(
      (employer) =>
        Number.isFinite(employer.lat) &&
        Number.isFinite(employer.lng) &&
        Number.isFinite(employer.radius),
    );

    if (!matchingLocations.length) {
      return res.status(400).json({
        message: "Employer location and radius are required",
      });
    }

    const isWithinEmployerRadius = (employer, candidateLat, candidateLng) =>
      isLocationWithinRadius({
        employerLat: employer.lat,
        employerLng: employer.lng,
        interviewLat: candidateLat,
        interviewLng: candidateLng,
        radiusInMeters: employer.radius,
      }).isWithinRadius;
    const mapMatch = matchingLocations.some((employer) =>
      isWithinEmployerRadius(employer, lat, lng),
    );
    const bothMatchSameRadius =
      hasIpLocation &&
      matchingLocations.some(
        (employer) =>
          isWithinEmployerRadius(employer, lat, lng) &&
          isWithinEmployerRadius(employer, ipLat, ipLng),
      );

    return res.status(200).json({
      message: hasIpLocation
        ? bothMatchSameRadius
          ? "Map and IP locations are within the same employer radius"
          : "Map and IP locations are not both within the same employer radius"
        : mapMatch
          ? "Candidate is within the employer radius"
          : "Candidate is outside the employer radius",
      isWithinRadius: mapMatch,
      isMapWithinRadius: mapMatch,
      ...(hasIpLocation && { isIpWithinRadius: bothMatchSameRadius }),
      employerId: employerId ?? null,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const normalizeCountryName = (countryName) =>
  countryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

export const checkCandidateJobCountry = async (req, res) => {
  try {
    const { employerId, candidateCountry } = req.body;

    if (!mongoose.Types.ObjectId.isValid(employerId)) {
      return res.status(400).json({ message: "Employer id is invalid" });
    }
    if (typeof candidateCountry !== "string" || !candidateCountry.trim()) {
      return res.status(400).json({ message: "Candidate country is required" });
    }

    const employerCountries = await EmployerPolygon.find({ employerId })
      .select("countryName -_id")
      .lean();

    if (employerCountries.length === 0) {
      return res.status(404).json({
        message: "No job countries are configured for this employer",
      });
    }

    const normalizedCandidateCountry = normalizeCountryName(candidateCountry);
    const allowedCountries = employerCountries.map(
      ({ countryName }) => countryName,
    );
    const isAllowed = allowedCountries.some(
      (countryName) =>
        normalizeCountryName(countryName) === normalizedCandidateCountry,
    );

    return res.status(200).json({
      candidateCountry,
      allowedCountries,
      isAllowed,
    });
  } catch (error) {
    console.error("Candidate job country verification failed:", error);
    return res.status(500).json({
      message: "Unable to verify candidate job country.",
    });
  }
};

export const polygonController = async (req, res) => {
  const array = await boundaryofPolygons();
  const lat = 28.44374;
  const lng = 77.05596;
  array.map((arr) => {
    const isCheckInside = isInside(arr, lat, lng);
    if (isCheckInside) {
      return res.status(200).json({ message: "candidate inside the city" });
    }
  });
  return res.status(200).json({ message: "candidate not inside the city" });
};
