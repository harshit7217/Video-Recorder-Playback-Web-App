import mongoose from "mongoose";

const employerPolygonModel = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerAccount",
      required: true,
    },
    countryName: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("EmployerPolygon", employerPolygonModel);
