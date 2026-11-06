import express from "express";
import {
  postEmployer,
  getAllEmployers,
  deleteEmployerById,
  updateEmployerById,
  registerEmployer,
  loginEmployer,
} from "../controllers/employerControllers.js";

const router = express.Router();

router.post("/post", postEmployer);
router.get("/", getAllEmployers);
router.delete("/:id", deleteEmployerById);
router.put("/:id", updateEmployerById);
router.post("/register-employer", registerEmployer);
router.post("/login-employer", loginEmployer);

export default router;
