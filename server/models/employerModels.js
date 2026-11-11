import mongoose from "mongoose";

const employerLocationSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerAccount",
      required: true,
      index: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    radius: {
      type: Number,
      default: 500,
    },
    name: {
      type: String,
      default: "Selected position",
    },
  },
  { timestamps: true },
);

export default mongoose.model("EmployerLocation", employerLocationSchema);
