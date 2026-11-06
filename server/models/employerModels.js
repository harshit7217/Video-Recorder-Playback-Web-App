import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
    },
    lng: {
      type: Number,
    },
    radius: Number,
    name: String,
  },
  { timestamps: true },
);

export default mongoose.model("Employer", employerSchema);
