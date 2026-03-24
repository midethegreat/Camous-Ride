import { Router, Request, Response } from "express";
import crypto from "crypto";
import { sendOTP } from "../services/twilioService";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

const router = Router();
const userRepository = AppDataSource.getRepository(User);

// In-memory store for 2FA codes. In a production environment, you should use
// a more persistent store like Redis.
const twoFACodeStore = new Map<string, { code: string; expiration: number }>();

// A helper to generate a random 6-digit code
const generateRandomCode = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * @route   POST /api/2fa/send-code
 * @desc    Generate and send a 2FA code
 * @access  Private
 */
router.post("/send-code", async (req: Request, res: Response) => {
  const { userId, method } = req.body;

  if (!userId || !method) {
    return res
      .status(400)
      .json({ message: "User ID and method are required." });
  }

  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const code = generateRandomCode();
    const expiration = Date.now() + 10 * 60 * 1000; // 10-minute expiration

    twoFACodeStore.set(userId, { code, expiration });

    console.log(`Generated 2FA code for user ${userId}: ${code}`);

    if (method === "email") {
      // --- Email Sending Logic ---
      console.log(`(Pretend) Sending email to ${user.email} with code: ${code}`);
      // In a real app, you would use a mail service here
    } else if (method === "phone") {
      if (!user.phoneNumber) {
        return res.status(400).json({ message: "User has no phone number registered." });
      }

      await sendOTP(user.phoneNumber, code);
      console.log(`Sent SMS to ${user.phoneNumber} with code: ${code}`);
    }

    res.status(200).json({ message: "Verification code sent successfully." });
  } catch (error) {
    console.error("Error sending 2FA code:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @route   POST /api/2fa/verify-code
 * @desc    Verify a 2FA code
 * @access  Private
 */
router.post("/verify-code", async (req: Request, res: Response) => {
  const { userId, code } = req.body;

  if (!userId || !code) {
    return res.status(400).json({ message: "User ID and code are required." });
  }

  const stored = twoFACodeStore.get(userId);

  if (!stored || stored.expiration < Date.now()) {
    return res.status(400).json({ message: "Code is invalid or has expired." });
  }

  if (stored.code !== code) {
    return res.status(400).json({ message: "Invalid verification code." });
  }

  // Code is correct, clear it from the store
  twoFACodeStore.delete(userId);

  res.status(200).json({ message: "Code verified successfully." });
});

export default router;
