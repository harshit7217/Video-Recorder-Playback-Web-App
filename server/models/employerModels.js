import mongoose from "mongoose";

const employerSchema = new mongoose.Schema(
  {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    radius: Number,
    name: String,
  },
  { timestamps: true },
);

export default mongoose.model("Employer", employerSchema);
