import express, { Express } from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { AppDataSource } from "./data-source";
import { initializeWebSocket } from "./notificationService";
import { CrossAppService } from "./services/crossAppService";
import driverRoutes from "./routes/driverRoutes";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import rideRoutes from "./routes/rideRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import adminRoutes from "./routes/adminRoutes";
import twoFaRoutes from "./routes/2fa.js";
import bankRoutes from "./routes/bankRoutes";
import cryptoRoutes from "./routes/cryptoRoutes";
import guestRoutes from "./routes/guestRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import diagnosticsRoutes from "./routes/diagnostics";
import fraudRoutes from "./routes/fraudRoutes";
import voucherRoutes from "./routes/voucherRoutes";
import chatRoutes from "./routes/chatRoutes";
import { handleFlutterwaveWebhook } from "./controllers/webhookController";
import { verifyFlutterwaveTransaction } from "./controllers/transactionController";

export class MultiServerBackend {
  private userApp: Express;
  private riderApp: Express;
  private userServer!: http.Server;
  private riderServer!: http.Server;
  private userIo!: SocketIOServer;
  private riderIo!: SocketIOServer;
  private crossAppService!: CrossAppService;

  constructor() {
    this.userApp = express();
    this.riderApp = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupCrossAppCommunication();
  }

  private setupMiddleware() {
    // User App Middleware (Port 8081)
    this.userApp.use(
      cors({
        origin: ["http://localhost:8081", "exp://localhost:8081"],
        credentials: true,
      }),
    );
    this.userApp.use(express.json());

    // Rider App Middleware (Port 8082)
    this.riderApp.use(
      cors({
        origin: ["http://localhost:8082", "exp://localhost:8082"],
        credentials: true,
      }),
    );
    this.riderApp.use(express.json());
  }

  private setupRoutes() {
    // User App Routes (Port 8081)
    this.userApp.use("/api/users", userRoutes);
    this.userApp.use("/api/rides", rideRoutes);
    this.userApp.use("/api/transactions", transactionRoutes);
    this.userApp.use("/api/notifications", notificationRoutes);
    this.userApp.use("/api/admin", adminRoutes);
    this.userApp.use("/api/2fa", twoFaRoutes);
    this.userApp.use("/api/banks", bankRoutes);
    this.userApp.use("/api/crypto", cryptoRoutes);
    this.userApp.use("/api/guest", guestRoutes);
    this.userApp.use("/api/diagnostics", diagnosticsRoutes);
    this.userApp.use("/api/fraud", fraudRoutes);
    this.userApp.use("/api/vouchers", voucherRoutes);
    this.userApp.use("/api/chat", chatRoutes);

    // Rider App Routes (Port 8082)
    this.riderApp.use("/api/drivers", driverRoutes);
    this.riderApp.use("/api/rides", rideRoutes);
    this.riderApp.use("/api/transactions", transactionRoutes);
    this.riderApp.use("/api/notifications", notificationRoutes);
    this.riderApp.use("/api/admin", adminRoutes);
    this.riderApp.use("/api/2fa", twoFaRoutes);
    this.riderApp.use("/api/banks", bankRoutes);
    this.riderApp.use("/api/crypto", cryptoRoutes);
    this.riderApp.use("/api/guest", guestRoutes);
    this.riderApp.use("/api/diagnostics", diagnosticsRoutes);
    this.riderApp.use("/api/fraud", fraudRoutes);
    this.riderApp.use("/api/vouchers", voucherRoutes);
    this.riderApp.use("/api/chat", chatRoutes);

    // Webhook routes for both apps
    this.userApp.use("/webhooks/flutterwave", handleFlutterwaveWebhook);
    this.riderApp.use("/webhooks/flutterwave", handleFlutterwaveWebhook);

    // Health check endpoints
    this.userApp.get("/health", (req, res) => {
      res.json({ status: "ok", app: "user", port: 8081 });
    });

    this.riderApp.get("/health", (req, res) => {
      res.json({ status: "ok", app: "rider", port: 8082 });
    });
  }

  private setupWebSocket() {
    this.userServer = http.createServer(this.userApp);
    this.riderServer = http.createServer(this.riderApp);

    this.userIo = new SocketIOServer(this.userServer, {
      cors: {
        origin: [
          "http://localhost:8081",
          "exp://localhost:8081",
          "http://192.168.0.121:8081",
        ],
        credentials: true,
      },
    });

    this.riderIo = new SocketIOServer(this.riderServer, {
      cors: {
        origin: [
          "http://localhost:8082",
          "exp://localhost:8082",
          "http://192.168.0.121:8082",
        ],
        credentials: true,
      },
    });

    // Initialize WebSocket handlers for both apps
    initializeWebSocket(this.userServer);
    initializeWebSocket(this.riderServer);
  }

  private setupCrossAppCommunication() {
    // Initialize cross-app service
    this.crossAppService = new CrossAppService(this.userIo, this.riderIo);
    console.log("🔄 Cross-app communication service initialized");
  }

  public async start() {
    try {
      // Initialize database
      await AppDataSource.initialize();
      console.log("✅ Data Source has been initialized!");

      // Start user app server
      this.userServer.listen(8081, "0.0.0.0", () => {
        console.log("🚀 User App Backend running on http://0.0.0.0:8081");
      });

      // Start rider app server
      this.riderServer.listen(8082, "0.0.0.0", () => {
        console.log("🚀 Rider App Backend running on http://0.0.0.0:8082");
      });

      console.log("🔄 Cross-app communication enabled");
      console.log("📱 User App API: http://localhost:8081/api");
      console.log("🏍️ Rider App API: http://localhost:8082/api");
    } catch (error) {
      console.error("❌ Error during server startup:", error);
      process.exit(1);
    }
  }

  public stop() {
    this.userServer.close();
    this.riderServer.close();
    console.log("🛑 Servers stopped");
  }
}
