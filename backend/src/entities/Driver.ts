import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Ride } from "./Ride";
import { Transaction } from "./Transaction";

export enum DriverStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  BUSY = "busy",
  ON_RIDE = "on-ride",
}

export enum DocumentStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export enum DriverTier {
  BRONZE = "bronze",
  SILVER = "silver",
  GOLD = "gold",
  PLATINUM = "platinum",
}

export enum DocumentType {
  LICENSE = "license",
  VEHICLE_REGISTRATION = "vehicle_registration",
  INSURANCE = "insurance",
}

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.driverProfile, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "varchar", length: 100 })
  vehicleMake: string;

  @Column({ type: "varchar", length: 100 })
  vehicleModel: string;

  @Column({ type: "varchar", length: 50 })
  vehicleColor: string;

  @Column({ type: "varchar", length: 20 })
  plateNumber: string;

  @Column({ type: "varchar", length: 50, default: "car" })
  vehicleType: string;

  @Column({ type: "int", default: 4 })
  maxPassengers: number;

  @Column({ type: "varchar", length: 50, default: DriverStatus.OFFLINE })
  status: DriverStatus;

  @Column({ type: "boolean", default: false })
  isVerified: boolean;

  @Column({ type: "boolean", default: true })
  isAvailable: boolean;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  earnings: number;

  @Column({ type: "int", default: 0 })
  totalRides: number;

  @Column({ type: "decimal", precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ type: "int", default: 0 })
  totalRatings: number;

  @Column({ type: "decimal", precision: 10, scale: 8, nullable: true })
  currentLat: number;

  @Column({ type: "decimal", precision: 11, scale: 8, nullable: true })
  currentLng: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  currentLocation: string;

  @Column({ type: "datetime", nullable: true })
  lastLocationUpdate: Date;

  @Column({ type: "datetime", nullable: true })
  lastRideAt: Date;

  @Column({ type: "varchar", length: 50, default: DriverTier.BRONZE })
  tier: DriverTier;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 100 })
  baseFare: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 50 })
  perKmRate: number;

  @Column({ type: "decimal", precision: 10, scale: 2, default: 10 })
  perMinuteRate: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  profileImage: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "varchar", length: 20, nullable: true })
  licenseNumber: string;

  @Column({ type: "date", nullable: true })
  licenseExpiry: Date;

  @Column({ type: "varchar", length: 255, nullable: true })
  licenseImage: string;

  @Column({ type: "varchar", length: 50, default: DocumentStatus.PENDING })
  licenseStatus: DocumentStatus;

  @Column({ type: "text", nullable: true })
  licenseRejectionReason: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  vehicleImage: string;

  @Column({ type: "varchar", length: 50, default: DocumentStatus.PENDING })
  vehicleStatus: DocumentStatus;

  @Column({ type: "text", nullable: true })
  vehicleRejectionReason: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  insuranceImage: string;

  @Column({ type: "varchar", length: 50, default: DocumentStatus.PENDING })
  insuranceStatus: DocumentStatus;

  @Column({ type: "text", nullable: true })
  insuranceRejectionReason: string;

  @OneToMany(() => Ride, (ride) => ride.driver)
  rides: Ride[];

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  canAcceptRide(): boolean {
    return (
      this.status === DriverStatus.ONLINE &&
      this.isVerified &&
      this.isAvailable &&
      !this.isOnRide()
    );
  }

  isOnRide(): boolean {
    return this.status === DriverStatus.ON_RIDE;
  }

  updateRating(newRating: number): void {
    const totalRating = this.rating * this.totalRatings + newRating;
    this.totalRatings += 1;
    this.rating = totalRating / this.totalRatings;
  }

  updateLocation(lat: number, lng: number, location: string): void {
    this.currentLat = lat;
    this.currentLng = lng;
    this.currentLocation = location;
    this.lastLocationUpdate = new Date();
  }

  goOnline(): void {
    if (this.isVerified) {
      this.status = DriverStatus.ONLINE;
      this.isAvailable = true;
    }
  }

  goOffline(): void {
    this.status = DriverStatus.OFFLINE;
    this.isAvailable = false;
  }

  startRide(): void {
    this.status = DriverStatus.ON_RIDE;
    this.isAvailable = false;
  }

  completeRide(): void {
    this.status = DriverStatus.ONLINE;
    this.isAvailable = true;
    this.lastRideAt = new Date();
  }
}
