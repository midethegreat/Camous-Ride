import { Router } from "express";
import {
  registerGuest,
  uploadGuestDocs,
  verifyGuestOtp,
  verifyGuestBank,
  loginGuest,
  checkGuestEmail,
} from "../controllers/guestController";

const router = Router();

router.post("/register", registerGuest);
router.get("/check-email", checkGuestEmail);
router.post("/upload-docs", uploadGuestDocs);
router.post("/verify-otp", verifyGuestOtp);
router.post("/bank-verify", verifyGuestBank);
router.post("/login", loginGuest);

export default router;
