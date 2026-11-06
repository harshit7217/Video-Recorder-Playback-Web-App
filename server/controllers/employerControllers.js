import employerModel from "../models/employerModels.js";
import { employerDetails, updatedRadius } from "../services/employerService.js";

const normalizeEmployerPayload = (body = {}) => {
  const { lat, lng, radius, name, locationName } = body;

  return {
    lat,
    lng,
    radius,
    name: name ?? locationName ?? "Selected position",
  };
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
