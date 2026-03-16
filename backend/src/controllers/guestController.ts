import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Guest } from "../entities/Guest";
import { User } from "../entities/User";
import { flutterwaveConfig } from "../constants/flutterwaveConfig";
import Flutterwave from "flutterwave-node-v3";
import { sendOtpEmail } from "../utils/mailer";
import bcrypt from "bcryptjs";

const guestRepository = AppDataSource.getRepository(Guest);
const flw = new Flutterwave(
  flutterwaveConfig.publicKey,
  flutterwaveConfig.secretKey,
);

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));
const addMinutes = (d: Date, mins: number) =>
  new Date(d.getTime() + mins * 60000);

export const checkGuestEmail = async (req: Request, res: Response) => {
  const email = (req.query.email as string) || (req.body as any)?.email;
  if (!email) {
    return res.status(400).json({ message: "email is required" });
  }
  try {
    const userRepo = AppDataSource.getRepository(User);
    const userWithEmail = await userRepo.findOne({ where: { email } });
    const guestWithEmail = await guestRepository.findOne({ where: { email } });
    const available = !userWithEmail && !guestWithEmail;
    return res
      .status(200)
      .json({ available, message: available ? "OK" : "Email already in use" });
  } catch (e) {
    return res.status(500).json({ message: "Failed to check email." });
  }
};

export const registerGuest = async (req: Request, res: Response) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .json({ message: "fullName, email and password are required" });
  }
  try {
    // Prevent email reuse across students and guests
    const userRepo = AppDataSource.getRepository(User);
    const userWithEmail = await userRepo.findOne({ where: { email } });
    if (userWithEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Disallow reusing an existing guest record to simplify UX
    const existingGuest = await guestRepository.findOne({ where: { email } });
    if (existingGuest) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const guest = new Guest();
    guest.fullName = fullName;
    guest.email = email;
    const salt = await bcrypt.genSalt(10);
    guest.passwordHash = await bcrypt.hash(password, salt);
    guest.otp = generateOtp();
    guest.otpExpires = addMinutes(new Date(), 10);
    guest.isVerified = false;
    await guestRepository.save(guest);
    try {
      await sendOtpEmail(email, guest.otp);
    } catch (e) {
      // Already logged in mailer; proceed in dev to allow testing
      if (process.env.NODE_ENV === "production") throw e;
    }
    return res.status(200).json({
      message: "OTP sent to email.",
      hint:
        process.env.NODE_ENV === "production"
          ? `Code sent to ${email.substring(0, 2)}***${email.substring(
              email.indexOf("@"),
            )}`
          : `DEV: ${guest.otp}`,
    });
  } catch (e: any) {
    console.error("registerGuest error:", e);
    return res.status(500).json({ message: "Failed to register guest." });
  }
};

export const loginGuest = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }
  try {
    const guest = await guestRepository.findOne({ where: { email } });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    if (!guest.passwordHash)
      return res
        .status(400)
        .json({ message: "Guest has no password set. Register again." });
    const ok = await bcrypt.compare(password, guest.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    if (!guest.isVerified)
      return res
        .status(403)
        .json({ message: "Email not verified. Verify before login." });
    return res.status(200).json({
      message: "Login successful",
      user: { id: guest.id, fullName: guest.fullName, email: guest.email, role: "guest" },
    });
  } catch (e: any) {
    return res.status(500).json({ message: "Login failed" });
  }
};

export const uploadGuestDocs = async (req: Request, res: Response) => {
  // Using multipart/form-data; req.body has fields and req.files has uploads if using a middleware.
  const { email, fullName } = (req.body || {}) as any;
  if (!email) return res.status(400).json({ message: "email is required" });
  try {
    const guest = await guestRepository.findOne({ where: { email } });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    if (fullName) guest.fullName = fullName;
    // In this demo we accept URIs from mobile; if using file upload middleware, map to stored URLs.
    // Fallback to client-side uploaded URIs for now.
    guest.nationalIdUrl =
      (req.body as any).nationalIdUrl || guest.nationalIdUrl || null;
    guest.selfieUrl = (req.body as any).selfieUrl || guest.selfieUrl || null;
    await guestRepository.save(guest);
    return res.status(200).json({ message: "Documents received." });
  } catch (e: any) {
    console.error("uploadGuestDocs error:", e);
    return res.status(500).json({ message: "Failed to upload documents." });
  }
};

export const verifyGuestOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "email and otp are required" });
  }
  try {
    const guest = await guestRepository.findOne({ where: { email } });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    if (
      !guest.otp ||
      !guest.otpExpires ||
      new Date(guest.otpExpires) < new Date()
    ) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new code." });
    }
    if (guest.otp !== otp) {
      return res.status(400).json({ message: "Invalid code." });
    }
    guest.isVerified = true;
    guest.otp = null;
    guest.otpExpires = null;
    await guestRepository.save(guest);
    return res.status(200).json({ message: "Guest verified.", role: "guest" });
  } catch (e: any) {
    console.error("verifyGuestOtp error:", e);
    return res.status(500).json({ message: "Failed to verify OTP." });
  }
};

export const verifyGuestBank = async (req: Request, res: Response) => {
  const { email, accountNumber, bankCode } = req.body;
  if (!email || !accountNumber || !bankCode) {
    return res
      .status(400)
      .json({ message: "email, accountNumber, bankCode are required" });
  }
  try {
    const guest = await guestRepository.findOne({ where: { email } });
    if (!guest) return res.status(404).json({ message: "Guest not found" });
    const response = await flw.Misc.verify_Account({
      account_number: accountNumber,
      account_bank: bankCode,
    });
    if (response.status !== "success") {
      return res.status(400).json({ message: "Bank verification failed" });
    }
    // Simple name check: ensure returned name includes part of guest full name
    const accountName: string = response.data?.account_name || "";
    const normalizedGuest = guest.fullName.toLowerCase().split(" ")[0];
    if (accountName.toLowerCase().includes(normalizedGuest)) {
      guest.bankVerified = true;
      await guestRepository.save(guest);
      return res.status(200).json({ message: "Bank verified.", accountName });
    }
    return res
      .status(400)
      .json({
        message: "Name mismatch during bank verification.",
        accountName,
      });
  } catch (e: any) {
    console.error("verifyGuestBank error:", e);
    return res.status(500).json({ message: "Failed to verify bank." });
  }
};
