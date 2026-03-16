import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { User } from "./User";

export enum FraudAction {
  FLAG = "flag",
  FREEZE = "freeze",
  KYC_SUBMIT = "kyc_submit",
  AML_LIMIT = "aml_limit",
  WITHDRAWAL_LOCK = "withdrawal_lock",
}

@Entity()
export class FraudLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column({ type: "varchar" })
  action!: FraudAction;

  @Column({ type: "text" })
  reason!: string;

  @Column({ type: "json", nullable: true })
  metadata!: any; // Store transaction amounts, velocities, etc.

  @CreateDateColumn()
  createdAt!: Date;
}
