import employerModel from "../models/employerModels.js";

const normalizeEmployerPayload = (body = {}) => {
  const { lat, lng, radius, name, locationName } = body;

  return {
    lat,
    lng,
    radius,
    name: name ?? locationName ?? "Selected position",
  };
};

export const createEmployer = async (req, res) => {
  try {
    const employer = await employerModel.create(
      normalizeEmployerPayload(req.body),
    );
    res.status(201).json(employer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const postEmployer = async (req, res) => {
  try {
    const newEmployer = new employerModel(normalizeEmployerPayload(req.body));
    await newEmployer.save();
    res.status(201).json(newEmployer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getAllEmpolyers = async (req, res) => {
  try {
    const employers = await employerModel.find();
    res.status(200).json(employers);
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

    res.status(200).json(updatedEmployer);
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