import { WebSocketServer, WebSocket } from "ws";
import { Server, IncomingMessage } from "http";
import { parse } from "url";
import { Duplex } from "stream";
import { AppDataSource } from "./data-source";
import { Notification } from "./entities/Notification";
import { User } from "./entities/User";
import { Driver } from "./entities/Driver";
import { DriverStatus } from "./entities/Driver";

interface WebSocketClient {
  ws: WebSocket;
  userId?: string;
  userType?: "user" | "driver";
  socketId: string;
}

const clients = new Map<string, WebSocketClient>();

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
          const userType = (query.userType as "user" | "driver") || "user";

          if (!userId) {
            console.error(
              "[WebSocket] Connection rejected: User ID is missing in query",
            );
            ws.close(1008, "User ID is required");
            return;
          }

          const socketId = `${userType}-${userId}-${Date.now()}`;
          const client: WebSocketClient = {
            ws,
            userId,
            userType,
            socketId,
          };

          clients.set(socketId, client);
          console.log(
            `[WebSocket] ${userType} client connected: ${socketId} (Total clients: ${clients.size})`,
          );

          ws.on("close", (code, reason) => {
            clients.delete(socketId);
            console.log(
              `[WebSocket] ${userType} client disconnected: ${socketId}. Code: ${code}, Reason: ${reason}`,
            );
          });

          ws.on("message", (message) => {
            console.log(
              `[WebSocket] Received message from ${userType} ${socketId}: ${message}`,
            );
            handleWebSocketMessage(socketId, message.toString());
          });

          ws.on("error", (error) => {
            console.error(
              `[WebSocket] Error for ${userType} ${socketId}:`,
              error,
            );
          });

          // Send a welcome message to confirm connection
          ws.send(
            JSON.stringify({
              type: "connection_established",
              message: `Successfully connected to ${userType} notification service`,
              userType,
              userId,
            }),
          );
        });
      } else {
        console.warn(
          `[WebSocket] Rejecting upgrade request for unknown path: ${pathname}`,
        );
        socket.destroy();
      }
    },
  );

  // Heartbeat to keep connections alive
  setInterval(() => {
    clients.forEach((client, socketId) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      } else {
        clients.delete(socketId);
        console.log(`Client connection closed, removed: ${socketId}`);
      }
    });
  }, 30000);

  console.log("WebSocket server initialized with cross-app support");
}

function handleWebSocketMessage(socketId: string, message: string) {
  try {
    const data = JSON.parse(message);
    const client = clients.get(socketId);

    if (!client) {
      console.warn(`[WebSocket] Client not found for socket: ${socketId}`);
      return;
    }

    switch (data.type) {
      case "ride_request":
        broadcastToDrivers("new_ride_request", data);
        break;
      case "driver_response":
        sendToUser(data.userId, "driver_response", data);
        break;
      case "driver_location_update":
        broadcastToUsers("driver_location_update", data);
        break;
      case "ride_status_update":
        sendToUser(data.userId, "ride_status_update", data);
        break;
      default:
        console.log(`[WebSocket] Unknown message type: ${data.type}`);
    }
  } catch (error) {
    console.error("[WebSocket] Error handling message:", error);
  }
}

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: "user" | "driver" = "user",
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

    const savedNotification =
      await notificationRepository.save(newNotification);
    console.log(`Saved notification to DB for ${type} ${userId}: ${title}`);

    // Send real-time notification
    sendToUser(userId, "notification", savedNotification, type);
  } catch (error) {
    console.error(
      `Error saving/sending notification for ${type} ${userId}:`,
      error,
    );
  }
}

export function sendToUser(
  userId: string,
  event: string,
  data: any,
  userType: "user" | "driver" = "user",
) {
  try {
    let sentCount = 0;
    clients.forEach((client, socketId) => {
      if (
        client.userId === userId &&
        client.userType === userType &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(
          JSON.stringify({
            type: event,
            data,
            timestamp: new Date().toISOString(),
          }),
        );
        sentCount++;
      }
    });
    console.log(
      `Sent ${event} to ${sentCount} ${userType} client(s) for user ${userId}`,
    );
  } catch (error) {
    console.error(`Error sending ${event} to ${userType} ${userId}:`, error);
  }
}

export function broadcastToDrivers(event: string, data: any) {
  try {
    let driverCount = 0;
    clients.forEach((client, socketId) => {
      if (
        client.userType === "driver" &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(
          JSON.stringify({
            type: event,
            data,
            timestamp: new Date().toISOString(),
          }),
        );
        driverCount++;
      }
    });
    console.log(`Broadcasted ${event} to ${driverCount} connected drivers`);
  } catch (error) {
    console.error(`Error broadcasting ${event} to drivers:`, error);
  }
}

export function broadcastToUsers(event: string, data: any) {
  try {
    let userCount = 0;
    clients.forEach((client, socketId) => {
      if (
        client.userType === "user" &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(
          JSON.stringify({
            type: event,
            data,
            timestamp: new Date().toISOString(),
          }),
        );
        userCount++;
      }
    });
    console.log(`Broadcasted ${event} to ${userCount} connected users`);
  } catch (error) {
    console.error(`Error broadcasting ${event} to users:`, error);
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

      const savedNotification =
        await notificationRepository.save(newNotification);

      sendToUser(user.id, "notification", savedNotification, "user");
    }
    console.log("Broadcasted and saved notifications for all users");
  } catch (error) {
    console.error("Error broadcasting notifications:", error);
  }
}

// Cross-app communication helpers
export class NotificationService {
  static broadcastDriverStatusUpdate(driver: Driver) {
    broadcastToDrivers("driver_status_update", {
      driverId: driver.id,
      status: driver.status,
      location: {
        lat: driver.currentLat,
        lng: driver.currentLng,
      },
      isAvailable: driver.isAvailable,
    });
  }

  static broadcastDriverLocationUpdate(driver: Driver) {
    broadcastToUsers("driver_location_update", {
      driverId: driver.id,
      location: {
        lat: driver.currentLat,
        lng: driver.currentLng,
      },
      status: driver.status,
    });
  }

  static notifyRideAccepted(ride: any, driver: Driver) {
    sendToUser(
      ride.userId,
      "ride_accepted",
      {
        rideId: ride.id,
        driver: {
          id: driver.id,
          name: driver.user.fullName,
          phoneNumber: driver.user.phoneNumber,
          vehicleMake: driver.vehicleMake,
          vehicleModel: driver.vehicleModel,
          vehicleColor: driver.vehicleColor,
          plateNumber: driver.plateNumber,
        },
        estimatedArrival: 5, // minutes - calculate based on distance
      },
      "user",
    );
  }

  static notifyRideRequest(ride: any) {
    broadcastToDrivers("new_ride_request", {
      rideId: ride.id,
      pickup: ride.origin,
      destination: ride.destination,
      fare: ride.fare,
      distance: ride.distanceKm,
      estimatedDuration: ride.durationMinutes,
      user: {
        id: ride.userId,
        name: ride.user.fullName,
        rating: ride.user.rating || 5,
      },
      pickupLocation: {
        lat: ride.pickupLat,
        lng: ride.pickupLng,
      },
      destinationLocation: {
        lat: ride.destinationLat,
        lng: ride.destinationLng,
      },
    });
  }
}
