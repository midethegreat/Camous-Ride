import { WebSocketServer, WebSocket } from "ws";
import { Server, IncomingMessage } from "http";
import { parse } from "url";
import { Duplex } from "stream";
import { AppDataSource } from "./data-source";
import { Notification } from "./entities/Notification";
import { User } from "./entities/User";

const clients = new Map<string, WebSocket>();

export function initializeWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on(
    "upgrade",
    (request: IncomingMessage, socket: Duplex, head: Buffer) => {
      const url = request.url || "";
      console.log(`[WebSocket] Upgrade request received for URL: ${url}`);
      const { pathname, query } = parse(url, true);
      console.log(`[WebSocket] Parsed pathname: "${pathname}"`);

      // Be flexible with trailing slashes
      const normalizedPath = pathname?.replace(/\/$/, "");

      if (normalizedPath === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          const userId = query.userId as string;
          if (!userId) {
            console.error("[WebSocket] Connection rejected: User ID is missing in query");
            ws.close(1008, "User ID is required");
            return;
          }

          clients.set(userId, ws);
          console.log(`[WebSocket] Client connected: ${userId} (Total clients: ${clients.size})`);

          ws.on("close", (code, reason) => {
            clients.delete(userId);
            console.log(`[WebSocket] Client disconnected: ${userId}. Code: ${code}, Reason: ${reason}`);
          });

          ws.on("message", (message) => {
            console.log(`[WebSocket] Received message from ${userId}: ${message}`);
          });

          ws.on("error", (error) => {
            console.error(`[WebSocket] Error for user ${userId}:`, error);
          });

          // Send a welcome message to confirm connection
          ws.send(JSON.stringify({ 
            type: "connection_established", 
            message: "Successfully connected to notification service" 
          }));
        });
      } else {
        console.warn(`[WebSocket] Rejecting upgrade request for unknown path: ${pathname}`);
        socket.destroy();
      }
    },
  );

  // Heartbeat to keep connections alive
  setInterval(() => {
    clients.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clients.delete(userId);
        console.log(`Client connection closed, removed: ${userId}`);
      }
    });
  }, 30000);

  console.log("WebSocket server initialized");
}

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
) {
  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({ id: userId as any });
    if (!user) {
      console.error(`User not found for notification: ${userId}`);
      return;
    }

    const newNotification = notificationRepository.create({
      user,
      title,
      message,
      isRead: false,
    });

    const savedNotification = await notificationRepository.save(newNotification);
    console.log(`Saved notification to DB for ${userId}: ${title}`);

    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(savedNotification));
      console.log(`Sent real-time notification to ${userId}: ${title}`);
    } else {
      console.log(`Client not connected for real-time notification to user ${userId}`);
    }
  } catch (error) {
    console.error(`Error saving/sending notification for user ${userId}:`, error);
  }
}

export async function broadcastNotification(message: any) {
  try {
    const notificationRepository = AppDataSource.getRepository(Notification);
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();

    for (const user of users) {
      const newNotification = notificationRepository.create({
        user,
        title: message.title || "Announcement",
        message: message.message || "",
        isRead: false,
      });

      const savedNotification = await notificationRepository.save(newNotification);
      
      const client = clients.get(user.id);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(savedNotification));
      }
    }
    console.log("Broadcasted and saved notifications for all users");
  } catch (error) {
    console.error("Error broadcasting notifications:", error);
  }
}
