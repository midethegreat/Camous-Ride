# Fraud Detection Log Documentation

## Overview

This document outlines the systematic checks used to detect and prevent money laundering (AML) and fraudulent ride activities within the platform.

## 1. AML (Anti-Money Laundering) Logic

### A. Deposit Limits (KYC-Based)

- **Unverified Users**: Deposits are disabled.
- **Verified (KYC) Users**:
  - Daily max deposit: ₦10,000 (Total for both Crypto and Bank).
  - Single max deposit: ₦10,000 per transaction.
  - Max 3 deposits per 24 hours.

### B. Withdrawal Restrictions

- **48-Hour Lock**: Funds from crypto deposits are locked for 48 hours to prevent rapid "mixing" of funds.
- **Ride-First Rule**: Users must take at least one valid ride before withdrawing any funds from their wallet. This ensures the wallet is used for its intended purpose and not as a crypto-to-fiat mixer.
- **Earned Balance Restriction**: Withdrawals are strictly limited to `earnedBalance` (money earned from providing services, e.g., for riders) to prevent direct withdrawal of deposited crypto funds.

## 2. Suspicious Activity Detection

### A. Velocity Checks (10-Minute Window)

- **Condition**: More than 5 deposits in 10 minutes.
- **Action**: Auto-flag and **FREEZE** wallet.
- **Reasoning**: High velocity is a common pattern for automated laundering bots.

### B. Outlier Detection (Size-Based)

- **Condition**: Deposit > 3x the user's average deposit history (based on last 10 transactions).
- **Action**: Flag for manual review.
- **Reasoning**: Sudden large deposits deviate from typical student usage patterns.

### C. Immediate Withdrawal Pattern

- **Condition**: Withdrawal attempt within 1 hour of a large deposit without any ride activity.
- **Action**: Block withdrawal and flag account.
- **Reasoning**: Typical "washing" behavior.

## 3. Fraud Logs (Database)

All flags and freezes are recorded in the `FraudLog` table:

- `id`: Unique identifier (UUID).
- `userId`: The flagged user.
- `action`: FLAG, FREEZE, AML_LIMIT, etc.
- `reason`: Specific trigger (e.g., "High deposit velocity").
- `metadata`: Transaction amounts and time windows.
- `createdAt`: Timestamp.
