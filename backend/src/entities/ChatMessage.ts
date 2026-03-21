import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  text!: string;

  @Column()
  sender!: "user" | "driver";

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => User)
  driver!: User;

  @Column({ default: "Just now" })
  timestamp!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
