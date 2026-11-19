import express from "express";
import {
  creatingLocationFlag,
  gettingLocationFlag,
  updatingLocationFlag,
} from "../controllers/locationSignalController.js";

const router = express.Router();

router.post("/", creatingLocationFlag);
router.put("/", updatingLocationFlag);
router.put("/:employerId", updatingLocationFlag);
router.get("/:employerId", gettingLocationFlag);

export default router;
