import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Transaction } from "./entities/Transaction";
import { Ride } from "./entities/Ride";
import { Notification } from "./entities/Notification";
import { BankAccount } from "./entities/BankAccount";
import { Guest } from "./entities/Guest";
import { FraudLog } from "./entities/FraudLog";
import { Voucher } from "./entities/Voucher";
import { ChatMessage } from "./entities/ChatMessage";
import { Driver } from "./entities/Driver";
import { Rider } from "./entities/Rider";
import { Vendor } from "./entities/Vendor";
import { Product } from "./entities/Product";
import { Order } from "./entities/Order";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [
    User,
    Transaction,
    Ride,
    Notification,
    BankAccount,
    Guest,
    FraudLog,
    Voucher,
    ChatMessage,
    Driver,
    Rider,
    Vendor,
    Product,
    Order,
  ],
  migrations: [],
  subscribers: [],
});
