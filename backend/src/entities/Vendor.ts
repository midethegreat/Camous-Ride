import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Product } from "./Product";
import { Order } from "./Order";

@Entity()
export class Vendor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  phoneNumber: string;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Product, (product) => product.vendor)
  products: Product[];

  @OneToMany(() => Order, (order) => order.vendor)
  orders: Order[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
