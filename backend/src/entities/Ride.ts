import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Driver } from "./Driver";

export enum RideStatus {
  BOOKED = "booked",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity()
export class Ride {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user!: User;

  @ManyToOne(() => Driver, { nullable: true })
  @JoinColumn({ name: "driverId" })
  driver?: Driver;

  @Column({ nullable: true })
  driverId?: number;

  @Column()
  origin!: string;

  @Column()
  destination!: string;

  @Column("float")
  fare!: number;

  @Column({ type: "float", nullable: true })
  distanceKm!: number; // For distance-based fare and fraud checks

  @Column({ type: "int", nullable: true })
  durationMinutes!: number; // For duration-based fare and fraud checks

  @Column({
    type: "simple-enum",
    enum: RideStatus,
    default: RideStatus.BOOKED,
  })
  status!: RideStatus;

  @Column({ type: "datetime", nullable: true })
  startedAt!: Date;

  @Column({ type: "datetime", nullable: true })
  completedAt!: Date;

  @Column({ length: 4, nullable: true })
  verificationCode!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ type: "int", nullable: true })
  rating!: number;

  @Column({ type: "float", nullable: true })
  tip!: number;

  @Column({ type: "float", default: 0 })
  commission!: number; // The platform's cut
}
