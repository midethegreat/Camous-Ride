import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
} from "typeorm";
import { Transaction } from "./Transaction";
import { Driver } from "./Driver";

export enum RewardTier {
  BRONZE = "Bronze",
  SILVER = "Silver",
  GOLD = "Gold",
  PLATINUM = "Platinum",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  matricNumber!: string;

  @Column()
  pin!: string;

  @Column({ nullable: true })
  idCardImage!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  fullName!: string;

  @Column()
  department!: string;

  @Column()
  level!: string;

  @Column()
  phoneNumber!: string;

  @Column({ type: "float", default: 0 })
  walletBalance!: number;

  @Column({ type: "float", default: 0 })
  earnedBalance!: number; // For drivers to track money from real rides

  @Column({ type: "datetime", nullable: true })
  lastWithdrawalAt!: Date | null;

  @Column({ type: "float", default: 50000 }) // Daily withdrawal limit
  dailyWithdrawalLimit!: number;

  @Column({ default: false })
  isFlagged!: boolean; // For fraud detection flagging

  @Column({ default: false })
  isKYCVerified!: boolean;

  @Column({ default: false })
  isBankVerified!: boolean;

  @Column({ nullable: true })
  governmentIdImage!: string;

  @Column({ nullable: true })
  selfieImage!: string;

  @Column({ type: "varchar", default: "active" })
  accountStatus!: "active" | "under_review" | "frozen";

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: "varchar", nullable: true })
  otp!: string | null;

  @Column({ type: "datetime", nullable: true })
  otpExpires!: Date | null;

  @Column({ default: 0 })
  rideCount!: number;

  @Column({
    type: "simple-enum",
    enum: RewardTier,
    default: RewardTier.BRONZE,
  })
  rewardTier!: RewardTier;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions!: Transaction[];

  // Driver-specific fields
  @Column({ default: false })
  isDriver!: boolean;

  @Column({ default: false })
  isOnline!: boolean;

  @Column({ default: false })
  isAvailable!: boolean;

  @Column({ type: "varchar", nullable: true })
  vehiclePlate!: string | null;

  @Column({ type: "varchar", nullable: true })
  vehicleModel!: string | null;

  @Column({ type: "varchar", nullable: true })
  driverLicense!: string | null;

  @Column({ type: "float", nullable: true })
  currentLatitude!: number | null;

  @Column({ type: "float", nullable: true })
  currentLongitude!: number | null;

  @OneToOne(() => Driver, (driver) => driver.user, { nullable: true })
  @JoinColumn()
  driverProfile?: Driver;
}
