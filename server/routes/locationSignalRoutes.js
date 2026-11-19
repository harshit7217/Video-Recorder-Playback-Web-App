import express from "express";
import {
  creatingLocationFlag,
  updatingLocationFlag,
} from "../controllers/locationSignalController.js";

const router = express.Router();

router.post("/", creatingLocationFlag);
router.put("/", updatingLocationFlag);
router.put("/:employerId", updatingLocationFlag);

export default router;
