import Candidate from "../models/candidateModel.js";

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
        const {username, password} = req.body;
        const candidate = await Candidate.findOne({username});
        if(!candidate) {
            return res.status(404).json({message: "Candidate not found"});
        }

        if(candidate.password !== password) {
            return res.status(401).json({message: "Invalid password"});
        }

        res.status(200).json({message: "Login successful", candidate});
    }catch (error) {
        res.status(400).json({message: error.message});
    }
}