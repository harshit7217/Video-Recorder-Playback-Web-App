import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  name: {
    type: String,
  },
});

export default mongoose.model("Candidate", candidateSchema);
