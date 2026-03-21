import { Router } from "express";
import { RiderAuthController } from "../controllers/riderAuthController";

const router = Router();

router.post("/send-otp", RiderAuthController.sendOtp);
router.post("/verify-otp", RiderAuthController.verifyOtp);
router.post("/register", RiderAuthController.register);
router.post("/login", RiderAuthController.login);

export default router;
