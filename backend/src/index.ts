import dotenv from "dotenv";

import express, { Express } from "express";
import cors from "cors";
import http from "http";
import { AppDataSource } from "./data-source";
import { initializeWebSocket } from "./notificationService";

import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import rideRoutes from "./routes/rideRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import adminRoutes from "./routes/adminRoutes"; // Import admin routes
import twoFaRoutes from "./routes/2fa.js";
import bankRoutes from "./routes/bankRoutes";
import cryptoRoutes from "./routes/cryptoRoutes";
import guestRoutes from "./routes/guestRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import diagnosticsRoutes from "./routes/diagnostics";
import fraudRoutes from "./routes/fraudRoutes";
import { handleFlutterwaveWebhook } from "./controllers/webhookController";
import { verifyFlutterwaveTransaction } from "./controllers/transactionController";
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  console.log("Incoming request headers:", req.headers);
  next();
});

app.use(cors());
app.use(express.json());

app.use(cors());
app.use(express.json());

// Connectivity check endpoint
app.get("/ping", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount the routes
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes); // Mount admin routes
app.use("/api/2fa", twoFaRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/crypto", cryptoRoutes);
app.use("/api/guests", guestRoutes);
app.use("/api/diagnostics", diagnosticsRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/webhooks", webhookRoutes);

// Public aliases for external services and mobile clients
app.post("/flutterwave-webhook", handleFlutterwaveWebhook);
app.post("/verify-payment", verifyFlutterwaveTransaction);

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Set up the WebSocket server
initializeWebSocket(server);

AppDataSource.initialize()
  .then(() => {
    console.log("Data Source has been initialized!");
    // Start the server
    server.listen(Number(port), "0.0.0.0", () => {
      console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization:", err);
  });
