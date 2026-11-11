import mongoose from "mongoose";
import validator from "validator";
import EmployerAccount from "../models/employerAccountModel.js";
import employerModel from "../models/employerModels.js";
import { employerDetails, updatedRadius } from "../services/employerService.js";

const defaultEmployerLocation = {
  lat: 28.44373061164518,
  lng: 77.05585275554049,
  radius: 500,
  name: "Shaheed Major Vikas Yadav Marg, Sector 39, Gurgaon, Haryana, 101301, India",
};

const normalizeEmployerPayload = (body = {}) => {
  const { lat, lng, radius, name, locationName, employerId } = body;

  return {
    employerId: employerId ? new mongoose.Types.ObjectId(employerId) : undefined,
    lat: lat ?? defaultEmployerLocation.lat,
    lng: lng ?? defaultEmployerLocation.lng,
    radius: radius ?? defaultEmployerLocation.radius,
    name: name ?? locationName ?? defaultEmployerLocation.name,
  };
};

export const registerEmployer = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (!validator.isEmail(username)) {
      return res.status(400).json({ message: "Email is not valid" });
    }

    if (
      !validator.isStrongPassword(password, {
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
    ) {
      return res.status(400).json({
        message:
          "Password is not strong enough. Please ensure your password meets the minimum requirements: minimum length - 8, at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const existingEmployer = await EmployerAccount.findOne({ username });
    if (existingEmployer) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const employer = new EmployerAccount({ username, password });
    await employer.save();

    res.status(201).json({
      message: "Registration Successful",
      employer: {
        _id: employer._id,
        username: employer.username,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message || error });
  }
};

export const loginEmployer = async (req, res) => {
  try {
    const { username, password } = req.body;

    const employer = await EmployerAccount.findOne({ username });
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    if (employer.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({
      message: "Login successful",
      employer: {
        _id: employer._id,
        username: employer.username,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const postEmployer = async (req, res) => {
  try {
    const { employerId } = req.body;

    if (!employerId) {
      return res.status(400).json({ message: "Employer id is required" });
    }

    const account = await EmployerAccount.findById(employerId);
    if (!account) {
      return res.status(404).json({ message: "Employer account not found" });
    }

    const payload = normalizeEmployerPayload(req.body);
    const newEmployer = new employerModel({
      ...payload,
      employerId: new mongoose.Types.ObjectId(employerId),
    });

    await newEmployer.save();

    res.status(201).json({
      message: "New Location Selected",
      _id: newEmployer._id,
      employerId: newEmployer.employerId,
      lat: newEmployer.lat,
      lng: newEmployer.lng,
      radius: newEmployer.radius,
      name: newEmployer.name,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllEmployers = async (req, res) => {
  try {
    const { employerId } = req.query;
    const filter = employerId
      ? { employerId: new mongoose.Types.ObjectId(employerId) }
      : {};

    const location = await employerModel.find(filter).lean();
    const locationList = employerDetails(location);

    res.status(200).json(locationList);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateEmployerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { employerId } = req.body;
    const filter = { _id: id };

    if (employerId) {
      filter.employerId = new mongoose.Types.ObjectId(employerId);
    }

    const updatedEmployer = await employerModel.findOneAndUpdate(
      filter,
      normalizeEmployerPayload(req.body),
      { new: true },
    );

    if (!updatedEmployer) {
      return res.status(404).json({ error: "Employer location not found" });
    }

    const updated = updatedRadius(updatedEmployer);
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteEmployerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { employerId } = req.query;

    const filter = { _id: id };
    if (employerId) {
      filter.employerId = new mongoose.Types.ObjectId(employerId);
    }

    const employer = await employerModel.findOneAndDelete(filter);
    if (!employer) {
      return res.status(404).json({ error: "Employer location not found" });
    }

    res.status(200).json({ message: "Employer deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
