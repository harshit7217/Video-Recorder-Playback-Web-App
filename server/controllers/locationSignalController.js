import mongoose from "mongoose";
import EmployerAccount from "../models/employerAccountModel.js";
import LocationSignal from "../models/signalFraud.js";

const flagFields = [
  "jobCountry",
  "ipAddress",
  "vpnDetection",
  "residentialProxy",
  "publicProxy",
];

const validatePayload = (body, employerId) => {
  if (!employerId) {
    return "Employer id is required";
  }
  if (!mongoose.Types.ObjectId.isValid(employerId)) {
    return "Employer id is invalid";
  }
  if (flagFields.some((field) => typeof body[field] !== "boolean")) {
    return "All location flags must be boolean values";
  }
  return null;
};

export const gettingLocationFlag = async (req, res) => {
  try {
    const { employerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employerId)) {
      return res.status(400).json({ message: "Employer id is invalid" });
    }

    const locationFlag = await LocationSignal.findOne({ employerId });
    if (!locationFlag) {
      return res.status(404).json({ message: "Location flags not found" });
    }

    return res.status(200).json({ locationFlag });
  } catch (error) {
    return res.status(400).json({ message: error.message || error });
  }
};

export const creatingLocationFlag = async (req, res) => {
  try {
    const { employerId } = req.body;
    const validationError = validatePayload(req.body, employerId);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const employer = await EmployerAccount.findById(employerId);
    if (!employer) {
      return res.status(404).json({ message: "Employer account not found" });
    }

    const existingFlag = await LocationSignal.findOne({ employerId });
    if (existingFlag) {
      return res.status(409).json({ message: "Location flags already exist" });
    }

    const locationFlag = new LocationSignal({
      employerId,
      jobCountry: req.body.jobCountry,
      ipAddress: req.body.ipAddress,
      vpnDetection: req.body.vpnDetection,
      residentialProxy: req.body.residentialProxy,
      publicProxy: req.body.publicProxy,
    });

    await locationFlag.save();

    return res.status(201).json({
      message: "Flag created",
      locationFlag,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || error });
  }
};

export const updatingLocationFlag = async (req, res) => {
  try {
    const employerId = req.params.employerId || req.body.employerId;
    const validationError = validatePayload(req.body, employerId);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const locationFlag = await LocationSignal.findOneAndUpdate(
      { employerId },
      {
        jobCountry: req.body.jobCountry,
        ipAddress: req.body.ipAddress,
        vpnDetection: req.body.vpnDetection,
        residentialProxy: req.body.residentialProxy,
        publicProxy: req.body.publicProxy,
      },
      { new: true, runValidators: true },
    );

    if (!locationFlag) {
      return res.status(404).json({ message: "Location flags not found" });
    }

    return res.status(200).json({
      message: "Flag updated",
      locationFlag,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message || error });
  }
};