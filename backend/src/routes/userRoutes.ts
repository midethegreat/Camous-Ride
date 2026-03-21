import express from "express";
import {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  deleteUser,
  updatePin,
  setPin,
  getUserBalance,
  submitKYC,
  verifyMatric,
  getAvailableDrivers,
  updateUserProfile,
} from "../controllers/userController";

const router = express.Router();

router.get("/verify-matric/:matricNumber", verifyMatric);
router.get("/drivers/available", getAvailableDrivers);
router.patch("/profile", updateUserProfile);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/set-pin", setPin);
router.delete("/delete", deleteUser);
router.patch("/update-pin", updatePin);
router.get("/:userId/balance", getUserBalance);
router.post("/submit-kyc", submitKYC); // Updated for AML compliance

export default router;
