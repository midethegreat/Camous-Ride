import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Guest } from "../entities/Guest";
import { BankAccount, VerificationStatus } from "../entities/BankAccount";
import { Driver, DriverStatus } from "../entities/Driver";
import { sendOtpEmail } from "../utils/mailer";
import { sendOTP } from "../services/twilioService";
import { sendNotification } from "../notificationService";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";
import { MoreThan } from "typeorm";
import axios from "axios";
import jwt from "jsonwebtoken";

import { STUDENT_DATABASE } from "../../../_mocks/data";

const userRepository = AppDataSource.getRepository(User);
const driverRepository = AppDataSource.getRepository(Driver);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * @desc    Verify matric number against school database
 * @route   GET /api/users/verify-matric/:matricNumber
 * @access  Public
 */
export const verifyMatric = async (req: Request, res: Response) => {
  const matricNumber = req.params.matricNumber as string;

  try {
    // Check mock database first (requested by user)
    if (STUDENT_DATABASE[matricNumber]) {
      console.log(`[Mock] Matric ${matricNumber} found in mock database.`);
      const student = STUDENT_DATABASE[matricNumber];
      return res.status(200).json({
        fullName: student.fullName,
        department: student.department,
        level: student.level,
        phoneNumber: student.phoneNumber,
      });
    }

    // Real university API integration fallback
    // Replace with actual university API endpoint
    const universityApiUrl =
      process.env.UNIVERSITY_API_URL || "https://api.university.edu.ng";
    const apiKey = process.env.UNIVERSITY_API_KEY;

    const response = await axios.get(
      `${universityApiUrl}/students/${matricNumber}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.data && response.data.student) {
      const student = response.data.student;
      return res.status(200).json({
        fullName: student.fullName,
        department: student.department,
        level: student.level,
        phoneNumber: student.phoneNumber,
      });
    }

    return res
      .status(404)
      .json({ message: "Matric number not found in university database." });
  } catch (error: any) {
    // If university API is not available, return a fallback response
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Matric number not found." });
    }

    console.error("University API error:", error.message);

    return res.status(503).json({
      message:
        "University verification service temporarily unavailable. Please try again later.",
    });
  }
};

/**
 * @desc    Get all available drivers
 * @route   GET /api/users/drivers/available
 * @access  Private
 */
export const getAvailableDrivers = async (req: Request, res: Response) => {
  try {
    // Get available drivers with their profiles
    const drivers = await driverRepository.find({
      where: {
        status: DriverStatus.ONLINE,
        isAvailable: true,
        isVerified: true,
      },
      relations: ["user"],
    });

    // Map to frontend Driver type with real data
    const formattedDrivers = drivers.map((d: Driver) => ({
      id: d.id,
      name: d.user.fullName,
      plateNumber: d.plateNumber || "N/A",
      rating: d.rating || 0,
      totalSeats: d.maxPassengers || 4,
      occupiedSeats: 0, // Will be calculated from active rides
      distance: 0, // Will be calculated based on user's location
      fare: d.baseFare || 100,
      status: d.status,
      image:
        d.profileImage ||
        d.user.selfieImage ||
        "https://via.placeholder.com/100",
      verified: d.isVerified,
      tricycleType: d.vehicleType || "car",
      online: d.status === DriverStatus.ONLINE,
      vehicleMake: d.vehicleMake,
      vehicleModel: d.vehicleModel,
      vehicleColor: d.vehicleColor,
      currentLat: d.currentLat,
      currentLng: d.currentLng,
      currentLocation: d.currentLocation,
      lastLocationUpdate: d.lastLocationUpdate,
    }));

    res.status(200).json(formattedDrivers);
  } catch (error) {
    console.error("Error fetching drivers:", error);
    res.status(500).json({ message: "Failed to fetch available drivers." });
  }
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/users/profile
 * @access  Private
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  const { userId, ...updates } = req.body;
  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: "User not found" });

    Object.assign(user, updates);
    await userRepository.save(user);
    res.json({ message: "Profile updated", user });
  } catch (e) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/**
 * @desc    Register a new user and send OTP
 * @route   POST /api/users/register
 * @access  Public
 */
export const registerUser = async (req: Request, res: Response) => {
  const {
    matricNumber,
    pin,
    idCardImage,
    email,
    fullName,
    department,
    level,
    phoneNumber,
  } = req.body;

  if (!matricNumber || !pin || !email || !fullName) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields." });
  }

  try {
    // Prevent email reuse across guests and students
    const guestRepo = AppDataSource.getRepository(Guest);
    const guestWithEmail = await guestRepo.findOne({ where: { email } });
    if (guestWithEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const existingUser = await userRepository.findOne({
      where: [{ matricNumber }, { email }],
    });

    if (existingUser) {
      if (existingUser.isVerified && pin !== "0000") {
        existingUser.pin = pin;
        await userRepository.save(existingUser);
        console.log("PIN set for user:", existingUser.email);
        return res.status(200).json({
          message: "Registration complete. PIN has been set.",
          user: { id: existingUser.id, email: existingUser.email },
        });
      }

      if (!existingUser.isVerified) {
        existingUser.otp = generateOtp();
        existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        try {
          await sendOtpEmail(existingUser.email, existingUser.otp);
          if (existingUser.phoneNumber) {
            await sendOTP(existingUser.phoneNumber, existingUser.otp);
          }
        } catch (e) {
          if (process.env.NODE_ENV === "production") throw e;
        }
        await userRepository.save(existingUser);
        console.log("OTP resent to unverified user:", existingUser.email);
        return res.status(200).json({
          message: "Verification code has been resent.",
          hint:
            process.env.NODE_ENV !== "production"
              ? `DEV: ${existingUser.otp}`
              : undefined,
        });
      }

      return res.status(400).json({ message: "User is already registered." });
    }

    const newUser = new User();
    newUser.matricNumber = matricNumber;
    newUser.pin = pin;
    newUser.idCardImage = idCardImage;
    newUser.email = email;
    newUser.fullName = fullName;
    newUser.department = department;
    newUser.level = level;
    newUser.phoneNumber = phoneNumber;
    newUser.otp = generateOtp();
    newUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    try {
      await sendOtpEmail(newUser.email, newUser.otp);
      if (newUser.phoneNumber) {
        await sendOTP(newUser.phoneNumber, newUser.otp);
      }
    } catch (e) {
      if (process.env.NODE_ENV === "production") throw e;
    }
    await userRepository.save(newUser);

    console.log("New user registered, OTP sent:", newUser.matricNumber);
    res.status(201).json({
      message:
        "User registered. Please check your email or phone for the verification code.",
      user: { id: newUser.id, email: newUser.email },
      hint:
        process.env.NODE_ENV !== "production"
          ? `DEV: ${newUser.otp}`
          : undefined,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return res
      .status(500)
      .json({ message: "Failed to register user. Please try again." });
  }
};

/**
 * @desc    Verify user's email with OTP
 * @route   POST /api/users/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.otp !== otp || !user.otpExpires || new Date() > user.otpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await userRepository.save(user);

    console.log("User email verified:", user.email);
    res.status(200).json({
      message: "Email verified successfully. You are now logged in.",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        matricNumber: user.matricNumber,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: "Server error during OTP verification." });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/users/resend-otp
 * @access  Public
 */
export const resendOtp = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }

    user.otp = generateOtp();
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await sendOtpEmail(email, user.otp);
    await userRepository.save(user);

    console.log("OTP resent to:", email);
    res.status(200).json({
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({ message: "Failed to resend verification email." });
  }
};

/**
 * @desc    Set the user's PIN after email verification
 * @route   POST /api/users/set-pin
 * @access  Public
 */
export const setPin = async (req: Request, res: Response) => {
  const { email, pin } = req.body;

  if (!email || !pin) {
    return res.status(400).json({ message: "Email and PIN are required." });
  }

  try {
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email first.",
      });
    }

    user.pin = pin;
    await userRepository.save(user);

    console.log("PIN successfully set for user:", email);
    return res.status(200).json({ message: "PIN has been set successfully." });
  } catch (error) {
    console.error("Error setting PIN:", error);
    return res.status(500).json({ message: "Failed to set PIN." });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/users/login
 * @access  Public
 */
export const loginUser = async (req: Request, res: Response) => {
  const { matricNumber, pin } = req.body;

  if (!matricNumber || !pin) {
    return res
      .status(400)
      .json({ message: "Please provide matric number and PIN" });
  }

  try {
    const user = await userRepository.findOneBy({ matricNumber });

    if (user && user.pin === pin) {
      if (!user.isVerified) {
        return res
          .status(401)
          .json({ message: "Please verify your email before logging in." });
      }
      console.log("User logged in successfully:", user.matricNumber);
      const token = jwt.sign(
        { id: user.id, email: user.email, matricNumber: user.matricNumber },
        JWT_SECRET,
        { expiresIn: "7d" },
      );
      res.json({
        message: "Login successful.",
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          matricNumber: user.matricNumber,
          walletBalance: user.walletBalance,
          idCardImage: user.idCardImage,
        },
      });
    } else {
      console.log("Login failed for matric number:", matricNumber);
      res.status(401).json({ message: "Invalid matric number or PIN" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during login." });
  }
};

/**
 * @desc    Update user PIN
 * @route   POST /api/users/update-pin
 * @access  Private
 */
export const updatePin = async (req: Request, res: Response) => {
  const { userId, oldPin, newPin } = req.body;

  if (!userId || !oldPin || !newPin) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.pin !== oldPin) {
      return res.status(400).json({ message: "Invalid old PIN." });
    }

    user.pin = newPin;
    await userRepository.save(user);

    // Send notification for PIN change
    await sendNotification(
      user.id,
      "Security Alert",
      "Your PIN has been successfully changed. If you did not authorize this, please contact support immediately.",
    );

    return res.status(200).json({ message: "PIN updated successfully." });
  } catch (error) {
    console.error("Error updating PIN:", error);
    return res.status(500).json({ message: "Failed to update PIN." });
  }
};

/**
 * @desc    Get user balance
 * @route   GET /api/users/:userId/balance
 * @access  Private
 */
export const getUserBalance = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await userRepository.findOneBy({ id: userId as any });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      balance: user.walletBalance || 0,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isKYCVerified: user.isKYCVerified,
        accountStatus: user.accountStatus,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return res.status(500).json({ message: "Failed to fetch balance." });
  }
};

/**
 * @desc    Log user out
 * @route   POST /api/users/logout
 * @access  Public
 */
export const logoutUser = (req: Request, res: Response) => {
  const { email } = req.body;
  console.log(`User logged out: ${email}`);
  res.status(200).json({ message: "Logged out successfully." });
};

/**
 * @desc    Submit KYC verification documents
 * @route   POST /api/users/:userId/submit-kyc
 * @access  Private
 */
export const submitKYC = async (req: Request, res: Response) => {
  // KYC implementation for AML compliance
  const {
    userId,
    fullName,
    email,
    governmentIdImage,
    selfieImage,
    bankCode,
    accountNumber,
    accountName,
  } = req.body;

  if (!userId || !fullName || !email || !governmentIdImage || !selfieImage) {
    return res.status(400).json({ message: "All KYC fields are required." });
  }

  try {
    const user = await userRepository.findOneBy({ id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user details
    user.fullName = fullName;
    user.email = email;
    user.governmentIdImage = governmentIdImage;
    user.selfieImage = selfieImage;
    user.accountStatus = "under_review";

    // If bank info is provided, link it and set bank verification status
    if (bankCode && accountNumber && accountName) {
      const bankAccountRepository = AppDataSource.getRepository(BankAccount);
      let bankAccount = await bankAccountRepository.findOne({
        where: { user: { id: userId as any }, accountNumber, bankCode },
      });

      if (!bankAccount) {
        bankAccount = new BankAccount();
        bankAccount.user = user;
        bankAccount.accountNumber = accountNumber;
        bankAccount.bankCode = bankCode;
        bankAccount.accountName = accountName;
      }
      bankAccount.status = VerificationStatus.VERIFIED;
      await bankAccountRepository.save(bankAccount);
      user.isBankVerified = true;
    }

    await userRepository.save(user);

    console.log(`KYC submitted for user: ${user.email}. Status: under_review`);

    // Simulate an admin review process
    setTimeout(async () => {
      const u = await userRepository.findOneBy({ id: userId });
      if (u) {
        u.isKYCVerified = true;
        u.accountStatus = "active";
        await userRepository.save(u);
        console.log(`KYC auto-approved for user: ${u.email}`);

        await sendNotification(
          u.id,
          "KYC Verified",
          "Your identity verification is complete. Your account is now fully active!",
        );
      }
    }, 10000); // 10 seconds auto-approval for demo

    return res.status(200).json({
      message:
        "KYC documents submitted successfully. Your account is now under review.",
      status: "under_review",
    });
  } catch (error) {
    console.error("Error submitting KYC:", error);
    return res.status(500).json({ message: "Failed to submit KYC documents." });
  }
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/users/delete
 * @access  Public
 */
export const deleteUser = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await userRepository.remove(user);
    console.log(`User account deleted: ${email}`);
    res.status(200).json({ message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error during account deletion." });
  }
};
