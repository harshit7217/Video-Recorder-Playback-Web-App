import express from "express";
import {
  createEmployer,
  postEmployer,
  getAllEmpolyers,
  deleteEmployerById,
  updateEmployerById,
} from "../controllers/employerControllers.js";

const router = express.Router();

router.post("/", createEmployer);
router.post("/post", postEmployer);
router.get("/", getAllEmpolyers);
router.delete("/:id", deleteEmployerById);
router.put("/:id", updateEmployerById);

export default router;
