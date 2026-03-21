import { MultiServerBackend } from "./multiServer";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize and start the multi-server backend
const backend = new MultiServerBackend();

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Received SIGINT, shutting down gracefully...");
  backend.stop();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  backend.stop();
  process.exit(0);
});

// Start the backend
backend.start().catch((error) => {
  console.error("❌ Failed to start backend:", error);
  process.exit(1);
});

console.log("🚀 Starting COLISDAV Multi-Server Backend...");
import { MultiServerBackend } from "./multiServer";

// Start the unified backend
const backend = new MultiServerBackend();
backend.start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down servers...");
  backend.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down servers...");
  backend.stop();
  process.exit(0);
});
