import { Router } from "express";
import {
  createVectorHandler,
  deleteVectorHandler,
  getVectorHandler,
  searchVectorsHandler,
  updateVectorHandler,
} from "../controllers/vectorController.js";

const router = Router();

router.post("/", createVectorHandler);
router.post("/search", searchVectorsHandler);
router.get("/:id", getVectorHandler);
router.put("/:id", updateVectorHandler);
router.delete("/:id", deleteVectorHandler);

export default router;
