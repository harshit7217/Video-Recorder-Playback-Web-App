import mongoose from "mongoose";

const locationFlagSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerAccount",
      required: true,
      unique: true,
    },
    jobCountry: {
      type: Boolean,
      required: true,
    },
    ipStatus: {
      type: Boolean,
      required: true,
    },
    vpnDetection: {
      type: Boolean,
      required: true,
    },
    residentialProxy: {
      type: Boolean,
      required: true,
    },
    publicProxy: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.models.LocationSignal ||
  mongoose.model("LocationSignal", locationFlagSchema);
