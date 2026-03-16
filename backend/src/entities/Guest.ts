import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

export enum GuestRole {
  GUEST = "guest",
}

@Entity()
export class Guest {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ type: "varchar", nullable: true })
  passwordHash!: string | null;

  @Column({ type: "text", nullable: true })
  nationalIdUrl!: string | null;

  @Column({ type: "text", nullable: true })
  selfieUrl!: string | null;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: "varchar", nullable: true })
  otp!: string | null;

  @Column({ type: "datetime", nullable: true })
  otpExpires!: Date | null;

  @Column({ default: false })
  bankVerified!: boolean;

  @Column({
    type: "simple-enum",
    enum: GuestRole,
    default: GuestRole.GUEST,
  })
  role!: GuestRole;

  @CreateDateColumn()
  createdAt!: Date;
}
