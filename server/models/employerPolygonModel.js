import mongoose from "mongoose";

const employerPolygonSchema = new mongoose.Schema(
  {
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployerAccount",
      required: true,
      unique: true,
    },
    osmIds: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

export default mongoose.model("EmployerPolygon", employerPolygonSchema);
