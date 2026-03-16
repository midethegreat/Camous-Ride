import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";
import { sendNotification } from "../notificationService";
import { MoreThan } from "typeorm";
import { checkSuspiciousActivity } from "../services/fraudService";

const transactionRepository = AppDataSource.getRepository(Transaction);
const userRepository = AppDataSource.getRepository(User);

// AML CONFIG
const MAX_DEPOSIT_LIMIT = 10000; // Hard limit for all deposits as per user request
const MAX_DEPOSITS_PER_DAY = 3;

export const initializeCryptoDeposit = async (req: Request, res: Response) => {
  const { userId, amount, coin, network, sourceWalletAddress } = req.body;

  if (!userId || !amount || !coin || !network) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const depositAmount = parseFloat(amount);

  // Validate deposit limit
  if (depositAmount > MAX_DEPOSIT_LIMIT) {
    return res.status(400).json({
      message: `Deposit limit exceeded. Maximum allowed is ₦${MAX_DEPOSIT_LIMIT.toLocaleString()}.`,
    });
  }

  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // A. KYC REQUIREMENT
    if (!user.isKYCVerified) {
      return res.status(403).json({
        message:
          "Your account must be KYC verified before making crypto deposits. Please complete identity verification.",
      });
    }

    if (
      user.accountStatus === "frozen" ||
      user.accountStatus === "under_review"
    ) {
      return res.status(403).json({
        message: `Your account is ${user.accountStatus}. Please contact support.`,
      });
    }

    // B. DEPOSIT LIMITS (Verified users max $500 per day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysTransactions = await transactionRepository.find({
      where: {
        user: { id: userId },
        type: TransactionType.DEPOSIT,
        method: "crypto",
        createdAt: MoreThan(todayStart),
      },
      relations: ["user"],
    });

    const totalToday = todaysTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0,
    );
    if (totalToday + depositAmount > MAX_DEPOSIT_LIMIT) {
      return res.status(400).json({
        message: `Daily deposit limit reached. You can only deposit up to ₦${MAX_DEPOSIT_LIMIT.toLocaleString()} per day.`,
      });
    }

    // C. SUSPICIOUS ACTIVITY DETECTION (VELOCITY/SIZE)
    const fraudCheck = await checkSuspiciousActivity(
      user,
      depositAmount,
      TransactionType.DEPOSIT,
    );
    if (fraudCheck.flagged) {
      return res.status(403).json({
        message:
          "Your account has been flagged for suspicious activity and frozen for review.",
      });
    }

    const transactionRef = `CRYPTO_${coin}_${Date.now()}`;

    const transaction = new Transaction();
    transaction.user = user;
    transaction.amount = depositAmount;
    transaction.type = TransactionType.DEPOSIT;
    transaction.method = "crypto";
    transaction.reference = transactionRef;
    transaction.status = TransactionStatus.PENDING;
    transaction.sourceWalletAddress = sourceWalletAddress;
    transaction.metadata = JSON.stringify({ coin, network });

    // Initial risk score (can be updated later by monitoring service)
    transaction.riskScore = 0.1;

    await transactionRepository.save(transaction);

    // In a real system, you'd generate a unique address for this user/transaction
    const mockAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";

    return res.status(200).json({
      address: mockAddress,
      reference: transactionRef,
      amount: transaction.amount,
    });
  } catch (error) {
    console.error("Error initializing crypto deposit:", error);
    return res
      .status(500)
      .json({ message: "Failed to initialize crypto deposit." });
  }
};

export const verifyCryptoDeposit = async (req: Request, res: Response) => {
  const { reference, txHash } = req.body;

  if (!reference) {
    return res.status(400).json({ message: "Reference is required." });
  }

  try {
    const transaction = await transactionRepository.findOne({
      where: { reference },
      relations: ["user"],
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      return res
        .status(200)
        .json({ message: "Deposit already completed.", transaction });
    }

    // UPDATE METADATA WITH TX HASH
    if (txHash) {
      const metadata = JSON.parse(transaction.metadata || "{}");
      metadata.txHash = txHash;
      transaction.metadata = JSON.stringify(metadata);
    }

    // In a real system, this would trigger an actual blockchain verification
    // For now, we update the transaction status to COMPLETED (simulating confirmation)
    transaction.status = TransactionStatus.COMPLETED;
    await transactionRepository.save(transaction);

    // Update user balance
    const user = transaction.user;
    user.walletBalance += transaction.amount;
    await userRepository.save(user);

    await sendNotification(
      user.id,
      "Deposit Confirmed",
      `Your crypto deposit of ₦${transaction.amount.toLocaleString()} has been confirmed and added to your wallet.`,
    );

    return res.status(200).json({
      message: "Deposit verified successfully.",
      transaction,
    });
  } catch (error) {
    console.error("Error verifying crypto deposit:", error);
    return res
      .status(500)
      .json({ message: "Failed to verify crypto deposit." });
  }
};
