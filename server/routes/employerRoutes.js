import express from "express";
import {
  postEmployer,
  getAllEmployers,
  deleteEmployerById,
  updateEmployerById,
} from "../controllers/employerControllers.js";

const router = express.Router();

router.post("/post", postEmployer);
router.get("/", getAllEmployers);
router.delete("/:id", deleteEmployerById);
router.put("/:id", updateEmployerById);

export default router;
