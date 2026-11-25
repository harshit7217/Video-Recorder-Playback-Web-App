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
      required: true,
      trim: true,
      index: true,
    },
    boundary: {
      type: [[[[Number]]]],
      required: true,
    },
    typeOfPolygon: {
      type: String,
      required: true,
      enum: ["Polygon", "MultiPolygon"],
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("EmployerPolygon", employerPolygonModel);
