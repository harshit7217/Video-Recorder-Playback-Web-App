import express from "express";
import { ipController } from "../controllers/ip-geolocationControllers.js";

const router = express.Router();

router.get("/ip-geolocation", ipController);

export default router;
