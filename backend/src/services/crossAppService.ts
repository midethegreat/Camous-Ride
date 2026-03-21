import { Server as SocketIOServer } from "socket.io";
import { AppDataSource } from "../data-source";
import { Ride, RideStatus } from "../entities/Ride";
import { Driver, DriverStatus } from "../entities/Driver";
import { User } from "../entities/User";

export interface RideRequestData {
  rideId: string;
  passengerId: string;
  passengerName: string;
  passengerAvatar: string;
  passengerRating: number;
  pickupLocation: string;
  dropoffLocation: string;
  distance: number;
  duration: number;
  fare: number;
  paymentMethod: string;
  seats: number;
  timestamp: string;
  estimatedArrival: string;
}

export interface DriverResponseData {
  rideId: string;
  driverId: string;
  passengerId: string;
  response: "accepted" | "declined";
  estimatedArrival?: string;
  driverLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  message?: string;
}

export interface DriverLocationUpdate {
  driverId: string;
  rideId?: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: "available" | "en-route" | "arrived" | "in-transit" | "completed";
}

export class CrossAppService {
  private userIo: SocketIOServer;
  private riderIo: SocketIOServer;
  private rideRepository = AppDataSource.getRepository(Ride);
  private driverRepository = AppDataSource.getRepository(Driver);
  private userRepository = AppDataSource.getRepository(User);

  constructor(userIo: SocketIOServer, riderIo: SocketIOServer) {
    this.userIo = userIo;
    this.riderIo = riderIo;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Handle user app connections
    this.userIo.on("connection", (socket) => {
      console.log("User app connected:", socket.id);

      // Join user-specific room for targeted notifications
      socket.on("join-user-room", (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined room user-${userId}`);
      });

      // Handle ride requests from user app
      socket.on("ride-request", async (data: RideRequestData) => {
        await this.handleRideRequest(data);
      });

      // Handle ride cancellations from user app
      socket.on(
        "ride-cancelled",
        async (data: { rideId: string; userId: string }) => {
          await this.handleRideCancellation(data);
        },
      );

      socket.on("disconnect", () => {
        console.log("User app disconnected:", socket.id);
      });
    });

    // Handle rider app connections
    this.riderIo.on("connection", (socket) => {
      console.log("Rider app connected:", socket.id);

      // Join driver-specific room for targeted notifications
      socket.on("join-driver-room", (driverId: string) => {
        socket.join(`driver-${driverId}`);
        console.log(`Driver ${driverId} joined room driver-${driverId}`);
      });

      // Handle driver responses
      socket.on("driver-response", async (data: DriverResponseData) => {
        await this.handleDriverResponse(data);
      });

      // Handle driver location updates
      socket.on(
        "driver-location-update",
        async (data: DriverLocationUpdate) => {
          await this.handleDriverLocationUpdate(data);
        },
      );

      // Handle driver status updates
      socket.on(
        "driver-status-update",
        async (data: { driverId: string; status: DriverStatus }) => {
          await this.handleDriverStatusUpdate(data);
        },
      );

      socket.on("disconnect", () => {
        console.log("Rider app disconnected:", socket.id);
      });
    });
  }

  private async handleRideRequest(data: RideRequestData) {
    try {
      console.log("Processing ride request:", data);

      // Find nearby available drivers
      const availableDrivers = await this.findNearbyAvailableDrivers(
        data.pickupLocation,
      );

      // Broadcast ride request to nearby drivers
      this.riderIo.emit("new-ride-request", data);

      // Send targeted notifications to specific drivers if needed
      for (const driver of availableDrivers) {
        this.riderIo
          .to(`driver-${driver.id}`)
          .emit("ride-request-notification", {
            ...data,
            driverId: driver.id,
            distanceFromDriver: this.calculateDistance(
              driver.location,
              data.pickupLocation,
            ),
          });
      }

      console.log(
        `Ride request ${data.rideId} broadcasted to ${availableDrivers.length} drivers`,
      );
    } catch (error) {
      console.error("Error handling ride request:", error);
      this.userIo.to(`user-${data.passengerId}`).emit("ride-request-error", {
        error: "Failed to process ride request",
        rideId: data.rideId,
      });
    }
  }

  private async handleDriverResponse(data: DriverResponseData) {
    try {
      console.log("Processing driver response:", data);

      // Update ride status in database
      const ride = await this.rideRepository.findOne({
        where: { id: data.rideId },
        relations: ["user", "driver"],
      });

      if (!ride) {
        throw new Error(`Ride ${data.rideId} not found`);
      }

      if (data.response === "accepted") {
        // Update ride status to booked
        ride.status = RideStatus.BOOKED;
        ride.driver = await this.driverRepository.findOne({
          where: { id: parseInt(data.driverId) },
        });
        await this.rideRepository.save(ride);

        // Notify passenger that driver accepted
        this.userIo.to(`user-${data.passengerId}`).emit("driver-accepted", {
          rideId: data.rideId,
          driverId: data.driverId,
          estimatedArrival: data.estimatedArrival,
          driverLocation: data.driverLocation,
          message: "Driver has accepted your ride request",
        });

        // Notify other drivers that ride is taken
        this.riderIo.emit("ride-taken", { rideId: data.rideId });

        console.log(`Driver ${data.driverId} accepted ride ${data.rideId}`);
      } else {
        // Notify passenger that driver declined
        this.userIo.to(`user-${data.passengerId}`).emit("driver-declined", {
          rideId: data.rideId,
          driverId: data.driverId,
          message: data.message || "Driver declined your ride request",
        });

        console.log(`Driver ${data.driverId} declined ride ${data.rideId}`);
      }
    } catch (error) {
      console.error("Error handling driver response:", error);

      // Notify driver of error
      this.riderIo.to(`driver-${data.driverId}`).emit("driver-response-error", {
        error: "Failed to process your response",
        rideId: data.rideId,
      });
    }
  }

  private async handleRideCancellation(data: {
    rideId: string;
    userId: string;
  }) {
    try {
      console.log("Processing ride cancellation:", data);

      // Update ride status in database
      const ride = await this.rideRepository.findOne({
        where: { id: data.rideId },
        relations: ["driver"],
      });

      if (ride && ride.driver) {
        // Notify assigned driver
        this.riderIo
          .to(`driver-${ride.driver.id}`)
          .emit("ride-cancelled-by-user", {
            rideId: data.rideId,
            userId: data.userId,
            message: "Passenger has cancelled the ride",
          });
      }

      // Broadcast cancellation to all drivers
      this.riderIo.emit("ride-cancelled", { rideId: data.rideId });

      console.log(`Ride ${data.rideId} cancelled by user ${data.userId}`);
    } catch (error) {
      console.error("Error handling ride cancellation:", error);
    }
  }

  private async handleDriverLocationUpdate(data: DriverLocationUpdate) {
    try {
      console.log("Processing driver location update:", data);

      // Update driver location in database
      const driver = await this.driverRepository.findOne({
        where: { id: parseInt(data.driverId) },
      });

      if (driver) {
        driver.currentLat = data.location.lat;
        driver.currentLng = data.location.lng;
        driver.currentLocation = data.location.address;
        await this.driverRepository.save(driver);
      }

      // Notify relevant users
      if (data.rideId) {
        // Notify passenger of driver's location update
        const ride = await this.rideRepository.findOne({
          where: { id: data.rideId },
          relations: ["user"],
        });

        if (ride && ride.user) {
          this.userIo
            .to(`user-${ride.user.id}`)
            .emit("driver-location-update", {
              rideId: data.rideId,
              driverId: data.driverId,
              location: data.location,
              status: data.status,
              timestamp: new Date().toISOString(),
            });
        }
      }

      // Broadcast driver availability to other drivers
      this.riderIo.emit("driver-location-updated", {
        driverId: data.driverId,
        location: data.location,
        status: data.status,
      });

      console.log(`Driver ${data.driverId} location updated`);
    } catch (error) {
      console.error("Error handling driver location update:", error);
    }
  }

  private async handleDriverStatusUpdate(data: {
    driverId: string;
    status: DriverStatus;
  }) {
    try {
      console.log("Processing driver status update:", data);

      // Update driver status in database
      const driver = await this.driverRepository.findOne({
        where: { id: parseInt(data.driverId) },
      });

      if (driver) {
        driver.status = data.status;
        await this.driverRepository.save(driver);
      }

      // Broadcast status update
      this.riderIo.emit("driver-status-updated", {
        driverId: data.driverId,
        status: data.status,
        timestamp: new Date().toISOString(),
      });

      console.log(`Driver ${data.driverId} status updated to ${data.status}`);
    } catch (error) {
      console.error("Error handling driver status update:", error);
    }
  }

  private async findNearbyAvailableDrivers(
    pickupLocation: string,
  ): Promise<Driver[]> {
    try {
      // This is a simplified implementation
      // In a real app, you would use geospatial queries
      const drivers = await this.driverRepository.find({
        where: { status: DriverStatus.ONLINE },
        relations: ["user"],
      });

      return drivers;
    } catch (error) {
      console.error("Error finding nearby drivers:", error);
      return [];
    }
  }

  private calculateDistance(location1: any, location2: string): number {
    // Simplified distance calculation
    // In a real app, use proper geospatial calculations
    return Math.random() * 5; // Random distance for demo
  }

  // Public methods for sending notifications
  public sendRideRequestToDriver(driverId: string, rideData: RideRequestData) {
    this.riderIo.to(`driver-${driverId}`).emit("new-ride-request", rideData);
  }

  public sendDriverAcceptedToUser(userId: string, data: any) {
    this.userIo.to(`user-${userId}`).emit("driver-accepted", data);
  }

  public sendDriverLocationToUser(userId: string, data: DriverLocationUpdate) {
    this.userIo.to(`user-${userId}`).emit("driver-location-update", data);
  }
}
