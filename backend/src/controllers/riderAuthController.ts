import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Rider, RiderStatus, RiderKycStatus } from "../entities/Rider";
import { sendOtpEmail } from "../utils/mailer";
import jwt from "jsonwebtoken";

const riderRepository = AppDataSource.getRepository(Rider);
const JWT_SECRET = process.env.JWT_SECRET || "your-rider-secret-key";

// In-memory store for pending OTPs (before rider is created)
const pendingOtps = new Map<string, { code: string; expiresAt: Date }>();

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export class RiderAuthController {
  /**
   * @desc    Send OTP to email for verification
   * @route   POST /api/riders/send-otp
   */
  static async sendOtp(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    try {
      // Check if email already registered
      const existingRider = await riderRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });
      if (existingRider) {
        return res
          .status(400)
          .json({ message: "An account with this email already exists." });
      }

      const code = generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      pendingOtps.set(email.toLowerCase().trim(), { code, expiresAt });

      try {
        await sendOtpEmail(email, code);
      } catch (e) {
        console.error("Failed to send OTP email:", e);
      }

      console.log(`📧 RIDER OTP for ${email}: ${code}`);
      res.status(200).json({
        message: "OTP sent successfully.",
        hint:
          process.env.NODE_ENV !== "production" ? `DEV: ${code}` : undefined,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send OTP." });
    }
  }

  /**
   * @desc    Verify rider email OTP
   * @route   POST /api/riders/verify-otp
   */
  static async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required." });

    const emailKey = email.toLowerCase().trim();
    const pending = pendingOtps.get(emailKey);

    if (!pending || pending.code !== otp || new Date() > pending.expiresAt) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    // Keep it in pending but verified (or just return success)
    res.status(200).json({ message: "Email verified successfully." });
  }

  /**
   * @desc    Register a new rider
   * @route   POST /api/riders/register
   */
  static async register(req: Request, res: Response) {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !phoneNumber || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    try {
      const emailKey = email.toLowerCase().trim();

      // Final check
      const existingRider = await riderRepository.findOne({
        where: { email: emailKey },
      });
      if (existingRider) {
        return res
          .status(400)
          .json({ message: "An account with this email already exists." });
      }

      const rider = new Rider();
      rider.fullName = fullName;
      rider.email = emailKey;
      rider.phoneNumber = phoneNumber;
      rider.password = password;
      rider.isVerified = true; // Mark as verified since they passed the OTP step

      await riderRepository.save(rider);
      pendingOtps.delete(emailKey); // Cleanup

      res.status(201).json({
        message: "Rider registered successfully.",
        rider: { id: rider.id, email: rider.email },
      });
    } catch (error) {
      console.error("Rider registration error:", error);
      res.status(500).json({ message: "Registration failed." });
    }
  }

  /**
   * @desc    Login rider
   * @route   POST /api/riders/login
   */
  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    try {
      const rider = await riderRepository.findOne({
        where: { email: email.toLowerCase().trim() },
      });
      if (!rider || rider.password !== password) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      if (!rider.isVerified) {
        return res
          .status(401)
          .json({ message: "Please verify your email before logging in." });
      }

      const token = jwt.sign({ id: rider.id, role: "rider" }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.status(200).json({
        message: "Login successful.",
        token,
        user: {
          id: rider.id,
          fullName: rider.fullName,
          email: rider.email,
          phone: rider.phoneNumber,
          kycStatus: rider.kycStatus,
          walletBalance: rider.walletBalance,
          rating: rider.rating,
          totalTrips: rider.totalTrips,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed." });
    }
  }
}
