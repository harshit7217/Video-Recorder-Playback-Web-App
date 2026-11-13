import express from "express";
import { vpnController } from "../controllers/vpn-detectionControllers.js";

const router = express.Router();

router.get("/detection", vpnController);

export default router;
