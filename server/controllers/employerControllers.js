import employerModel from "../models/employerModels.js";

export const createEmployer = async (req, res) => {
  try {
    const employee = await employerModel.create(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const postEmployer = async (req, res) => {
  try {
    const { lat, lng, radius, locationName } = req.body;
    const newEmployer = new employerModel({ lat, lng, radius, locationName });
    await newEmployer.save();
    res.status(201).json(newEmployer);
  }catch(err){
    res.status(400).json({ error: err.message })
  }
}

export const getAllEmpolyers = async (req, res) => {
  try {
    const employers = await employerModel.find();
    res.status(200).json(employers);
  }catch(err){
    res.status(400).json({ error: err.message })
  }
}
