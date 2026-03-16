import express from "express";
import { getFraudLogs, resolveFraudFlag } from "../controllers/fraudController";

const router = express.Router();

// Admin-only endpoints (assuming middleware will be added later)
router.get("/logs", getFraudLogs);
router.post("/resolve", resolveFraudFlag);

export default router;
