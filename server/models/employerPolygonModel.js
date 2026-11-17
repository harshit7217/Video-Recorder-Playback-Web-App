import mongoose from "mongoose";

const employerPolygonModel = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerAccount",
      required: true,
      index: true,
    },
    countryName: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("EmployerPolygon", employerPolygonModel);
