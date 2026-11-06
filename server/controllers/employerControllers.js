import employerModels from "../models/employerModels.js";
import employerModel from "../models/employerModels.js";
import { employerDetails, updatedRadius } from "../services/employerService.js";
import validator from "validator";

const normalizeEmployerPayload = (body = {}) => {
  const { lat, lng, radius, name, locationName } = body;

  return {
    username,
    password,
    lat,
    lng,
    radius,
    name: name ?? locationName ?? "Selected position",
  };
};

export const registerEmployer = async (req, res) => {
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
    const existingEmployer = await employerModels.findOne({ username });
    if (existingEmployer) {
      return res.status(400).json({ message: "Username already exists" });
    }
    const employer = new employerModels({ username, password });
    await employer.save();
    res.status(201).json({ message: "Registration Successful" });
  } catch (error) {
    res.status(404).json({ message: error });
  }
};

export const loginEmployer = async (req, res) => {
  try {
    const { username, password } = req.body;
    const employer = await employerModels.findOne({ username });
    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    if (employer.password !== password) {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(200).json({ message: "Login successful", employer });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const postEmployer = async (req, res) => {
  try {
    const newEmployer = new employerModel(normalizeEmployerPayload(req.body));
    await newEmployer.save();
    res.status(201).json({ message: "New Location Selected" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllEmployers = async (req, res) => {
  try {
    const location = await employerModel.find().lean();

    const locationList = employerDetails(location);

    res.status(200).json(locationList);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateEmployerById = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedEmployer = await employerModel.findByIdAndUpdate(
      id,
      normalizeEmployerPayload(req.body),
      { new: true },
    );

    if (!updatedEmployer) {
      return res.status(404).json({ error: "Employer not found" });
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
    const employer = await employerModel.findByIdAndDelete(id);
    if (!employer) {
      return res.status(404).json({ error: "Employer not found" });
    }
    res.status(200).json({ message: "Employer deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
