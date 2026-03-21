import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from "typeorm";

export enum RiderStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  UNDER_REVIEW = "under_review",
}

export enum RiderKycStatus {
  PENDING = "pending",
  SUBMITTED = "submitted",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

@Entity()
export class Rider {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string; // Using 'password' for riders

  @Column()
  fullName!: string;

  @Column()
  phoneNumber!: string;

  @Column({ type: "float", default: 0 })
  walletBalance!: number;

  @Column({ type: "float", default: 0 })
  earnedBalance!: number;

  @Column({
    type: "varchar",
    default: RiderStatus.ACTIVE,
  })
  status!: RiderStatus;

  @Column({
    type: "varchar",
    default: RiderKycStatus.PENDING,
  })
  kycStatus!: RiderKycStatus;

  @Column({ default: false })
  isVerified!: boolean; // Email verification status

  @Column({ type: "varchar", nullable: true })
  otp!: string | null;

  @Column({ type: "datetime", nullable: true })
  otpExpires!: Date | null;

  @Column({ default: 0 })
  rating!: number;

  @Column({ default: 0 })
  totalTrips!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
