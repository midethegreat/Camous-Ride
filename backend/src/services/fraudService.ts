import { User } from "../entities/User";
import { Ride } from "../entities/Ride";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";
import { FraudLog, FraudAction } from "../entities/FraudLog";
import { AppDataSource } from "../data-source";
import { MoreThan } from "typeorm";

export const FRAUD_CONFIG = {
  WITHDRAWAL_HOLD_PERIOD_HOURS: 24, // Hold funds for 24 hours before withdrawal
  MAX_DAILY_DEPOSITS: 5,
  MAX_DAILY_WITHDRAWALS: 2,
  MIN_RIDE_DURATION_MINUTES: 3, // Rides shorter than this are suspicious
  MIN_RIDE_DISTANCE_KM: 0.5, // Rides shorter than this are suspicious
  MAX_DEPOSITS_WINDOW_MINUTES: 10,
  MAX_DEPOSITS_COUNT_WINDOW: 5,
  CRYPTO_WITHDRAWAL_LOCK_HOURS: 48,
  LARGE_DEPOSIT_MULTIPLIER: 3, // 3x larger than average history is suspicious
};

export const checkSuspiciousActivity = async (
  user: User,
  amount: number,
  type: TransactionType,
) => {
  const transactionRepo = AppDataSource.getRepository(Transaction);

  // 1. Check for velocity (more than 5 deposits within 10 minutes)
  if (type === TransactionType.DEPOSIT) {
    const tenMinutesAgo = new Date(
      Date.now() - FRAUD_CONFIG.MAX_DEPOSITS_WINDOW_MINUTES * 60 * 1000,
    );
    const recentDeposits = await transactionRepo.count({
      where: {
        user: { id: user.id },
        type: TransactionType.DEPOSIT,
        createdAt: MoreThan(tenMinutesAgo),
      },
    });

    if (recentDeposits >= FRAUD_CONFIG.MAX_DEPOSITS_COUNT_WINDOW) {
      return await flagAndFreezeUser(
        user,
        "High deposit velocity (5+ in 10 mins)",
      );
    }

    // 2. Check for unusually large deposit compared to account history
    const previousDeposits = await transactionRepo.find({
      where: {
        user: { id: user.id },
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
      },
      take: 10,
      order: { createdAt: "DESC" },
    });

    if (previousDeposits.length >= 3) {
      const avgDeposit =
        previousDeposits.reduce((sum, tx) => sum + tx.amount, 0) /
        previousDeposits.length;
      if (amount > avgDeposit * FRAUD_CONFIG.LARGE_DEPOSIT_MULTIPLIER) {
        return await flagAndFreezeUser(
          user,
          `Unusually large deposit (₦${amount}) compared to average (₦${avgDeposit.toFixed(2)})`,
        );
      }
    }
  }

  // 3. Repeated deposits followed by withdrawal attempts
  if (type === TransactionType.WITHDRAWAL) {
    const recentDeposits = await transactionRepo.find({
      where: {
        user: { id: user.id },
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.COMPLETED,
      },
      take: 3,
      order: { createdAt: "DESC" },
    });

    if (recentDeposits.length > 0) {
      const lastDeposit = recentDeposits[0];
      const timeSinceDeposit =
        (Date.now() - lastDeposit.createdAt.getTime()) / (1000 * 60 * 60);

      // If withdrawing right after deposit (less than 1 hour) and no rides taken
      if (timeSinceDeposit < 1 && user.rideCount === 0) {
        return await flagAndFreezeUser(
          user,
          "Withdrawal attempt immediately after deposit without activity",
        );
      }
    }
  }

  return { flagged: false };
};

const flagAndFreezeUser = async (user: User, reason: string) => {
  const userRepo = AppDataSource.getRepository(User);
  const fraudLogRepo = AppDataSource.getRepository(FraudLog);

  user.isFlagged = true;
  user.accountStatus = "under_review";
  await userRepo.save(user);

  // Create official log
  const log = new FraudLog();
  log.user = user;
  log.action = FraudAction.FREEZE;
  log.reason = reason;
  await fraudLogRepo.save(log);

  console.log(
    `[FRAUD ALERT] User ${user.id} flagged and marked under_review: ${reason}`,
  );
  return { flagged: true, reason };
};

export const isSuspiciousRide = (ride: Ride) => {
  // Prevent fake ride cycling
  if (ride.distanceKm && ride.distanceKm < FRAUD_CONFIG.MIN_RIDE_DISTANCE_KM)
    return true;
  if (
    ride.durationMinutes &&
    ride.durationMinutes < FRAUD_CONFIG.MIN_RIDE_DURATION_MINUTES
  )
    return true;

  return false;
};

export const canWithdraw = async (user: User, amount: number) => {
  if (user.isFlagged || user.accountStatus === "frozen") {
    return {
      allowed: false,
      reason: "Account is flagged for review or frozen.",
    };
  }

  // D. WITHDRAWAL RESTRICTIONS
  const transactionRepo = AppDataSource.getRepository(Transaction);

  // 1. Check for 48-hour lock after crypto deposit
  const fortyEightHoursAgo = new Date(
    Date.now() - FRAUD_CONFIG.CRYPTO_WITHDRAWAL_LOCK_HOURS * 60 * 60 * 1000,
  );
  const recentCryptoDeposit = await transactionRepo.findOne({
    where: {
      user: { id: user.id },
      type: TransactionType.DEPOSIT,
      method: "crypto",
      status: TransactionStatus.COMPLETED,
      createdAt: MoreThan(fortyEightHoursAgo),
    },
  });

  if (recentCryptoDeposit) {
    return {
      allowed: false,
      reason: `Funds from crypto deposits are locked for ${FRAUD_CONFIG.CRYPTO_WITHDRAWAL_LOCK_HOURS} hours after deposit.`,
    };
  }

  // 2. Check for ride-first usage (prevent laundering)
  // If the user has a high balance but zero rides, prevent withdrawal
  if (user.rideCount === 0 && user.walletBalance > 1000) {
    return {
      allowed: false,
      reason:
        "Withdrawal rule : you must have used funds for at least one ride before withdrawing",
    };
  }

  // 3. Earned Balance Check (Already existing, but reinforced)
  if (amount > user.earnedBalance) {
    return {
      allowed: false,
      reason:
        "Withdrawals are restricted to earned funds from ride provision. Direct deposits cannot be withdrawn.",
    };
  }

  // 4. Check for sudden large withdrawal after inactivity (Velocity check)
  const fraudCheck = await checkSuspiciousActivity(
    user,
    amount,
    TransactionType.WITHDRAWAL,
  );
  if (fraudCheck.flagged) {
    return {
      allowed: false,
      reason: "Withdrawal flagged for suspicious activity review.",
    };
  }

  // 5. Check for daily limits
  if (amount > user.dailyWithdrawalLimit) {
    return {
      allowed: false,
      reason: "Amount exceeds your daily withdrawal limit.",
    };
  }

  // 6. Check for KYC
  if (!user.isKYCVerified) {
    return {
      allowed: false,
      reason: "Full KYC identity verification required for all withdrawals.",
    };
  }

  return { allowed: true };
};
