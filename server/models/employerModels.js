import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    lat: Number,
    lng: Number,
    radius: Number,
    name: String,
  },
  { timestamps: true },
);

export default mongoose.model("Employer", employerSchema);
