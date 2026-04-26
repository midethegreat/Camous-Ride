import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Vendor } from "./Vendor";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column("decimal")
  price: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isAvailable: boolean;

  @ManyToOne(() => Vendor, (vendor) => vendor.products)
  vendor: Vendor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
