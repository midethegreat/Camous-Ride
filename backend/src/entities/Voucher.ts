import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity()
export class Voucher {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  code!: string;

  @Column({ type: "float" })
  discount!: number;

  @Column()
  description!: string;

  @Column({ type: "datetime" })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;
}
