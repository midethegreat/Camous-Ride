import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Vendor } from "./Vendor";

export enum OrderStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column()
  deliveryAddress: string;

  @Column()
  productName: string;

  @Column()
  quantity: number;

  @Column("decimal")
  totalAmount: number;

  @Column({
    type: "simple-enum",
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ManyToOne(() => Vendor, (vendor) => vendor.orders)
  vendor: Vendor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
