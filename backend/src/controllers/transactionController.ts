import { Request, Response } from "express";
import axios from "axios"; // Import axios
import { AppDataSource } from "../data-source";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";
import { User } from "../entities/User";
import { sendNotification } from "../notificationService";
import { flutterwaveConfig } from "../constants/flutterwaveConfig";
import { canWithdraw, checkSuspiciousActivity } from "../services/fraudService";
import { MoreThan } from "typeorm";

const transactionRepository = AppDataSource.getRepository(Transaction);
const userRepository = AppDataSource.getRepository(User);

// AML CONFIG
const MAX_DEPOSIT_LIMIT = 10000;

export const createTransaction = async (req: Request, res: Response) => {
  const { userId, type, amount } = req.body;

  if (!userId || !type || !amount) {
    return res
      .status(400)
      .json({ message: "Missing required fields: userId, type, or amount." });
  }

  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Anti-Money Laundering (AML) Check
    const suspiciousCheck = await checkSuspiciousActivity(user, amount, type);
    if (suspiciousCheck.flagged) {
      user.isFlagged = true;
      await userRepository.save(user);
      return res.status(403).json({
        message:
          "Transaction flagged for security review. Please contact support.",
      });
    }

    // Withdrawal logic with holding period and earned balance check
    if (type === TransactionType.WITHDRAWAL) {
      const withdrawalCheck = await canWithdraw(user, amount);
      if (!withdrawalCheck.allowed) {
        return res.status(400).json({ message: withdrawalCheck.reason });
      }

      user.walletBalance -= amount;
      user.earnedBalance -= amount;
      user.lastWithdrawalAt = new Date();

      const transaction = new Transaction();
      transaction.user = user;
      transaction.type = type;
      transaction.amount = amount;
      transaction.status = TransactionStatus.COMPLETED;

      await userRepository.save(user);
      await transactionRepository.save(transaction);

      await sendNotification(
        user.id,
        "Withdrawal Successful",
        `Your withdrawal of ${amount} has been processed. New balance: ${user.walletBalance}.`,
      );

      return res
        .status(201)
        .json({ message: "Withdrawal successful.", transaction });
    }

    // Create and save the new transaction
    const transaction = new Transaction();
    transaction.user = user;
    transaction.type = type;
    transaction.amount = amount;

    // Update user's wallet balance based on transaction type
    if (type === TransactionType.DEPOSIT) {
      user.walletBalance += amount;
      transaction.status = TransactionStatus.COMPLETED;
      await userRepository.save(user);
      await transactionRepository.save(transaction);

      // Send notification for deposit
      await sendNotification(
        user.id,
        "Deposit Successful",
        `Your wallet has been credited with ${amount}. Your new balance is ${user.walletBalance}.`,
      );
    } else if (type === TransactionType.PAYMENT) {
      if (user.walletBalance < amount) {
        return res
          .status(400)
          .json({ message: "Insufficient wallet balance." });
      }
      user.walletBalance -= amount;
      transaction.status = TransactionStatus.COMPLETED;
      await userRepository.save(user);
      await transactionRepository.save(transaction);

      await sendNotification(
        user.id,
        "Payment Successful",
        `A payment of ${amount} has been made from your account. Your new balance is ${user.walletBalance}.`,
      );
    }

    console.log(
      `Transaction created for user ${user.email}: ${type} of ${amount}`,
    );
    return res.status(201).json({
      message: "Transaction created successfully.",
      transaction,
      newBalance: user.walletBalance,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return res.status(500).json({ message: "Failed to create transaction." });
  }
};

export const initializeFlutterwavePayment = async (
  req: Request,
  res: Response,
) => {
  const { userId, amount, email, phoneNumber, fullName, redirectUrl } =
    req.body;

  if (!userId || !amount || !email || !phoneNumber || !fullName) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const depositAmount = parseFloat(amount);
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

    // KYC Requirement for Bank/Card Deposits
    if (!user.isKYCVerified) {
      return res.status(403).json({
        message:
          "Your identity must be verified before making deposits. Please complete KYC verification.",
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

    // Daily limit check
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todaysTransactions = await transactionRepository.find({
      where: {
        user: { id: userId },
        type: TransactionType.DEPOSIT,
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

    const transactionRef = `CAMPUSRIDE_${Date.now()}`;

    const payload = {
      tx_ref: transactionRef,
      amount: Number(amount),
      currency: "NGN",
      redirect_url: redirectUrl || "https://cid.dev/wallet", // Use provided redirectUrl or default
      payment_options: "card,banktransfer,ussd",
      customer: {
        email,
        phonenumber: phoneNumber,
        name: fullName,
      },
      customizations: {
        title: "CampusRide Wallet Deposit",
        description: "Fund your CampusRide wallet",
        logo: "https://your-app.com/logo.png",
      },
    };

    const response = await axios.post(
      "https://api.flutterwave.com/v3/payments",
      payload,
      {
        headers: {
          Authorization: `Bearer ${flutterwaveConfig.secretKey}`,
        },
      },
    );

    if (response.data.status === "success") {
      const newTransaction = new Transaction();
      newTransaction.user = user;
      newTransaction.amount = parseFloat(amount);
      newTransaction.type = TransactionType.DEPOSIT;
      newTransaction.reference = transactionRef; // Use the generated ref for lookup
      newTransaction.status = TransactionStatus.PENDING;
      await transactionRepository.save(newTransaction);

      res.status(200).json({ link: response.data.data.link });
    } else {
      throw new Error("Failed to initialize payment.");
    }
  } catch (error: any) {
    console.error("Error initializing Flutterwave payment:", error);
    res
      .status(500)
      .json({ message: "Failed to initialize payment.", error: error.message });
  }
};

export const verifyFlutterwaveTransaction = async (
  req: Request,
  res: Response,
) => {
  const { tx_ref, transaction_id } = req.body;
  console.log("[BACKEND VERIFY] Request received with body:", req.body);

  if (!transaction_id) {
    console.log("[BACKEND VERIFY] Error: Missing transaction_id.");
    return res.status(400).json({ message: "Transaction ID is required." });
  }

  try {
    console.log(
      `[BACKEND VERIFY] Verifying with Flutterwave, transaction_id: ${transaction_id}`,
    );
    const verificationResponse = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${flutterwaveConfig.secretKey}`,
        },
      },
    );

    const { data } = verificationResponse;
    console.log(
      "[BACKEND VERIFY] Flutterwave API response:",
      JSON.stringify(data, null, 2),
    );

    if (data.status === "success" && data.data.status === "successful") {
      const transactionDetails = data.data;
      const { tx_ref: flutterwaveTxRef } = transactionDetails;
      console.log(
        `[BACKEND VERIFY] Flutterwave verification successful for tx_ref: ${flutterwaveTxRef}`,
      );

      let transaction = await transactionRepository.findOne({
        where: { reference: flutterwaveTxRef }, // Use the reference from Flutterwave
        relations: ["user"],
      });

      // If transaction exists and is already successful, do nothing further.
      if (transaction && transaction.status === TransactionStatus.COMPLETED) {
        console.log(
          `[BACKEND VERIFY] Transaction ${flutterwaveTxRef} already processed and successful.`,
        );
        return res.status(200).json({
          message: "Transaction already verified.",
          newBalance: transaction.user.walletBalance,
        });
      }

      // If transaction exists but is not successful, or doesn't exist, proceed.
      if (!transaction) {
        console.log(
          `[BACKEND VERIFY] No existing transaction found for ref: ${flutterwaveTxRef}. Creating a new one.`,
        );
        const { userId } = req.body; // Get userId from the initial request
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
          return res.status(404).json({ message: "User not found." });
        }
        transaction = new Transaction();
        transaction.user = user;
        transaction.reference = flutterwaveTxRef;
        transaction.type = TransactionType.DEPOSIT;
      } else {
        console.log(
          `[BACKEND VERIFY] Found existing transaction in DB with status: ${transaction.status}`,
        );
      }

      // Update transaction details
      transaction.amount = parseFloat(transactionDetails.amount);
      transaction.status = TransactionStatus.COMPLETED; // Use the enum value

      // Update user's wallet balance
      const user = transaction.user;
      const oldBalance = user.walletBalance;
      user.walletBalance += transaction.amount;

      // Save both entities in a single transaction
      // Save the updated entities
      await userRepository.save(user);
      await transactionRepository.save(transaction);

      console.log(
        `[BACKEND VERIFY] User wallet updated. Old: ${oldBalance}, New: ${user.walletBalance}`,
      );

      await sendNotification(
        user.id,
        "Deposit Successful",
        `Your wallet has been credited with ${transaction.amount} NGN. Your new balance is ${user.walletBalance} NGN.`,
      );

      return res.status(200).json({
        message: "Transaction verified and wallet updated successfully.",
        newBalance: user.walletBalance,
        amount: transaction.amount,
        reference: transaction.reference,
      });
    } else {
      console.log(
        `[BACKEND VERIFY] Flutterwave verification failed or payment not successful. Status: ${data.data.status}`,
      );
      const failedRef =
        (data && data.data && data.data.tx_ref) || (tx_ref as string);
      const transaction = await transactionRepository.findOne({
        where: {
          reference: failedRef,
          status: TransactionStatus.PENDING,
        },
        relations: ["user"],
      });

      if (transaction) {
        transaction.status = TransactionStatus.FAILED;
        await transactionRepository.save(transaction);
        console.log(
          `[BACKEND VERIFY] Marked transaction ${transaction.reference} as failed.`,
        );
        await sendNotification(
          transaction.user.id,
          "Deposit Failed",
          `Your deposit of ${transaction.amount} NGN failed. Please try again.`,
        );
      }

      return res.status(400).json({
        message: "Transaction verification failed or payment not successful.",
      });
    }
  } catch (error: any) {
    console.error(
      "[BACKEND VERIFY] CATCH BLOCK: Error verifying Flutterwave transaction:",
      error.response ? error.response.data : error.message,
    );
    return res
      .status(500)
      .json({ message: "Failed to verify transaction.", error: error.message });
  }
};

export const getTransactionsByUser = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const transactions = await transactionRepository.find({
      where: { user: { id: String(userId) } },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    return res.status(200).json(transactions);
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ message: "Failed to fetch transactions." });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res
      .status(400)
      .json({ message: "Missing required fields: userId or amount." });
  }

  const withdrawalAmount = parseFloat(amount);

  try {
    const user = await userRepository.findOne({
      where: { id: userId },
      relations: ["transactions"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Use unified fraud/AML check
    const withdrawalCheck = await canWithdraw(user, withdrawalAmount);
    if (!withdrawalCheck.allowed) {
      return res.status(400).json({ message: withdrawalCheck.reason });
    }

    // Create and save the new withdrawal transaction
    const transaction = new Transaction();
    transaction.user = user;
    transaction.type = TransactionType.WITHDRAWAL;
    transaction.amount = withdrawalAmount;
    transaction.status = TransactionStatus.COMPLETED;

    user.walletBalance -= withdrawalAmount;
    user.earnedBalance -= withdrawalAmount;
    user.lastWithdrawalAt = new Date();

    await userRepository.save(user);
    await transactionRepository.save(transaction);

    // Send notification for withdrawal
    await sendNotification(
      user.id,
      "Withdrawal Successful",
      `Your withdrawal of ₦${withdrawalAmount.toLocaleString()} has been processed. Your new balance is ₦${user.walletBalance.toLocaleString()}.`,
    );

    return res.status(200).json({
      message: "Withdrawal successful.",
      newBalance: user.walletBalance,
      transaction,
    });
  } catch (error: any) {
    console.error("Error during withdrawal:", error);
    return res.status(500).json({ message: "Failed to process withdrawal." });
  }
};
