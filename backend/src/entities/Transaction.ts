import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum TransactionType {
  DEPOSIT = "deposit",
  PAYMENT = "payment",
  WITHDRAWAL = "withdrawal",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({
    type: "simple-enum",
    enum: TransactionType,
  })
  type!: TransactionType;

  @Column("float")
  amount!: number;

  @Column({
    type: "simple-enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ nullable: true })
  reference!: string;

  @Column({ type: "varchar", nullable: true, default: "flutterwave" })
  method!: string; // 'flutterwave', 'crypto', 'manual'

  @Column({ type: "boolean", default: false })
  isFlagged!: boolean; // For AML/Fraud review

  @Column({ type: "varchar", nullable: true })
  metadata!: string; // Store coin, network, txHash etc.

  @Column({ type: "float", default: 0 })
  riskScore!: number; // 0.0 to 1.0

  @Column({ type: "varchar", nullable: true })
  sourceWalletAddress!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
