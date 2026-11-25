import express from "express";
import {
  postEmployer,
  getAllEmployers,
  deleteEmployerById,
  updateEmployerById,
  registerEmployer,
  loginEmployer,
  addingCountryPolygon,
  gettingAllCountryPolygon,
  deletingAllCountryPolygons,
} from "../controllers/employerControllers.js";

const router = express.Router();

router.post("/post", postEmployer);
router.get("/", getAllEmployers);
router.delete("/country-details", deletingAllCountryPolygons);
router.delete("/:id", deleteEmployerById);
router.put("/:id", updateEmployerById);
router.post("/register-employer", registerEmployer);
router.post("/login-employer", loginEmployer);
router.post("/country", addingCountryPolygon);
router.get("/country-details", gettingAllCountryPolygon);

export default router;
