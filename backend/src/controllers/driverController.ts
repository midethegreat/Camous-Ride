import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import {
  Driver,
  DriverStatus,
  DocumentStatus,
  DriverTier,
  DocumentType,
} from "../entities/Driver";
import { User } from "../entities/User";

interface AuthRequest extends Request {
  user?: any;
}
import { Ride, RideStatus } from "../entities/Ride";
import { NotificationService } from "../notificationService";
import { Transaction } from "../entities/Transaction";

const driverRepository = AppDataSource.getRepository(Driver);
const userRepository = AppDataSource.getRepository(User);
const rideRepository = AppDataSource.getRepository(Ride);
const transactionRepository = AppDataSource.getRepository(Transaction);

export class DriverController {
  // Get all drivers with filters
  static async getAllDrivers(req: Request, res: Response) {
    try {
      const { status, verified, tier, lat, lng, radius = 5 } = req.query;

      const queryBuilder = driverRepository
        .createQueryBuilder("driver")
        .leftJoinAndSelect("driver.user", "user")
        .leftJoinAndSelect("driver.rides", "rides");

      if (status) {
        queryBuilder.andWhere("driver.status = :status", { status });
      }

      if (verified !== undefined) {
        queryBuilder.andWhere("driver.isVerified = :verified", {
          verified: verified === "true",
        });
      }

      if (tier) {
        queryBuilder.andWhere("driver.tier = :tier", { tier });
      }

      if (lat && lng) {
        // Add location-based filtering (within radius in km)
        queryBuilder.andWhere(
          `(
            6371 * acos(
              cos(radians(:lat)) * cos(radians(driver.currentLat)) *
              cos(radians(driver.currentLng) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(driver.currentLat))
            )
          ) <= :radius`,
          {
            lat: parseFloat(lat as string),
            lng: parseFloat(lng as string),
            radius: parseFloat(radius as string),
          },
        );
      }

      const drivers = await queryBuilder.getMany();

      res.status(200).json({
        success: true,
        data: drivers,
        total: drivers.length,
      });
    } catch (error) {
      console.error("Error fetching drivers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch drivers",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Get driver by ID
  static async getDriverById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const driver = await driverRepository
        .createQueryBuilder("driver")
        .leftJoinAndSelect("driver.user", "user")
        .leftJoinAndSelect("driver.rides", "rides")
        .leftJoinAndSelect("driver.transactions", "transactions")
        .where("driver.id = :id", { id: parseInt(id as string) })
        .getOne();

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      res.status(200).json({
        success: true,
        data: driver,
      });
    } catch (error) {
      console.error("Error fetching driver:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch driver",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Create driver profile
  static async createDriverProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const {
        vehicleMake,
        vehicleModel,
        vehicleColor,
        plateNumber,
        licenseNumber,
        licenseExpiry,
        vehicleType,
        maxPassengers,
        baseFare,
        perKmRate,
        perMinuteRate,
      } = req.body;

      // Check if user exists
      const user = await userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if driver profile already exists
      const existingDriver = await driverRepository.findOne({
        where: { userId },
      });
      if (existingDriver) {
        return res.status(400).json({
          success: false,
          message: "Driver profile already exists",
        });
      }

      const driver = driverRepository.create({
        userId,
        vehicleMake,
        vehicleModel,
        vehicleColor,
        plateNumber,
        licenseNumber,
        licenseExpiry,
        vehicleType,
        maxPassengers,
        baseFare,
        perKmRate,
        perMinuteRate,
        status: DriverStatus.OFFLINE,
        isVerified: false,
        isAvailable: false,
      });

      await driverRepository.save(driver);

      res.status(201).json({
        success: true,
        message: "Driver profile created successfully",
        data: driver,
      });
    } catch (error) {
      console.error("Error creating driver profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create driver profile",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Update driver status
  static async updateDriverStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const validStatuses = Object.values(DriverStatus);
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }

      const driver = await driverRepository.findOne({
        where: { id: parseInt(id as string) },
      });
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      // Check if driver can go online
      if (status === DriverStatus.ONLINE && !driver.isVerified) {
        return res.status(400).json({
          success: false,
          message: "Driver must be verified to go online",
        });
      }

      driver.status = status;
      await driverRepository.save(driver);

      // Notify WebSocket clients
      NotificationService.broadcastDriverStatusUpdate(driver);

      res.status(200).json({
        success: true,
        message: "Driver status updated successfully",
        data: driver,
      });
    } catch (error) {
      console.error("Error updating driver status:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update driver status",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Update driver location
  static async updateDriverLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { lat, lng } = req.body;

      const driver = await driverRepository.findOne({
        where: { id: parseInt(id as string) },
      });
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      if (typeof lat !== "number" || typeof lng !== "number") {
        return res.status(400).json({
          success: false,
          message: "Invalid location coordinates",
        });
      }

      driver.updateLocation(lat, lng, "Current Location");
      await driverRepository.save(driver);

      // Broadcast location update to nearby riders
      NotificationService.broadcastDriverLocationUpdate(driver);

      res.status(200).json({
        success: true,
        message: "Location updated successfully",
        data: {
          driverId: driver.id,
          location: { lat: driver.currentLat, lng: driver.currentLng },
        },
      });
    } catch (error) {
      console.error("Error updating driver location:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update driver location",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Accept ride request
  static async acceptRide(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { rideId } = req.body;

      const driver = await driverRepository.findOne({
        where: { id: parseInt(id as string) },
        relations: ["user"],
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      const ride = await rideRepository.findOne({
        where: { id: rideId as string },
        relations: ["rider", "driver"],
      });

      if (!ride) {
        return res.status(404).json({
          success: false,
          message: "Ride not found",
        });
      }

      if (ride.status !== RideStatus.BOOKED) {
        return res.status(400).json({
          success: false,
          message: "Ride is no longer available",
        });
      }

      if (!driver.canAcceptRide()) {
        return res.status(400).json({
          success: false,
          message: "Driver cannot accept rides at this time",
        });
      }

      // Assign driver to ride
      ride.driver = driver;
      ride.status = RideStatus.IN_PROGRESS;
      ride.driverId = driver.id;
      await rideRepository.save(ride);

      // Update driver status
      driver.status = DriverStatus.ON_RIDE;
      await driverRepository.save(driver);

      // Send notifications
      NotificationService.notifyRideAccepted(ride, driver);

      res.status(200).json({
        success: true,
        message: "Ride accepted successfully",
        data: ride,
      });
    } catch (error) {
      console.error("Error accepting ride:", error);
      res.status(500).json({
        success: false,
        message: "Failed to accept ride",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Get nearby drivers
  static async getNearbyDrivers(req: Request, res: Response) {
    try {
      const { lat, lng, radius = 5 } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const drivers = await driverRepository
        .createQueryBuilder("driver")
        .leftJoinAndSelect("driver.user", "user")
        .where("driver.status = :status", { status: DriverStatus.ONLINE })
        .andWhere("driver.isVerified = :verified", { verified: true })
        .andWhere("driver.isAvailable = :available", { available: true })
        .andWhere(
          `(
            6371 * acos(
              cos(radians(:lat)) * cos(radians(driver.currentLat)) *
              cos(radians(driver.currentLng) - radians(:lng)) +
              sin(radians(:lat)) * sin(radians(driver.currentLat))
            )
          ) <= :radius`,
          {
            lat: parseFloat(lat as string),
            lng: parseFloat(lng as string),
            radius: parseFloat(radius as string),
          },
        )
        .getMany();

      res.status(200).json({
        success: true,
        data: drivers,
        total: drivers.length,
      });
    } catch (error) {
      console.error("Error fetching nearby drivers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch nearby drivers",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Get driver earnings
  static async getDriverEarnings(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const driver = await driverRepository.findOne({
        where: { id: parseInt(id as string) },
        relations: ["transactions", "rides"],
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      let transactions = driver.transactions || [];

      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        transactions = transactions.filter(
          (t) => t.createdAt >= start && t.createdAt <= end,
        );
      }

      const totalEarnings = transactions.reduce((sum, t) => sum + t.amount, 0);
      const completedRides =
        driver.rides?.filter((r) => r.status === RideStatus.COMPLETED).length ||
        0;

      res.status(200).json({
        success: true,
        data: {
          totalEarnings,
          completedRides,
          currentBalance: driver.earnings,
          tier: driver.tier,
          rating: driver.rating,
          transactions: transactions,
        },
      });
    } catch (error) {
      console.error("Error fetching driver earnings:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch driver earnings",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Get driver profile for rider app
  static async getDriverProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const driver = await driverRepository.findOne({
        where: { id: parseInt(id as string) },
        relations: ["user"],
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      const profile = {
        id: driver.id,
        name: driver.user.fullName,
        email: driver.user.email,
        phone: driver.user.phoneNumber,
        avatar: driver.profileImage || driver.user.selfieImage,
        rating: driver.rating,
        totalTrips: driver.totalRides,
        memberSince: driver.createdAt,
        status: driver.isVerified ? "verified" : "pending",
        university: "Federal University of Agriculture, Abeokuta", // Default for now
        matricNumber: driver.user.matricNumber,
        department: driver.user.department,
        level: driver.user.level,
        vehicle: {
          type: driver.vehicleType,
          plateNumber: driver.plateNumber,
          color: driver.vehicleColor,
          capacity: driver.maxPassengers,
          model: `${driver.vehicleMake} ${driver.vehicleModel}`,
          year: "2022", // Default for now
        },
      };

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error("Error fetching driver profile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch driver profile",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Get driver dashboard stats
  static async getDriverStats(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { period = "today" } = req.query;

      const driver = await driverRepository.findOne({
        where: { id: parseInt(id as string) },
        relations: ["transactions", "rides"],
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      let startDate = new Date();
      let endDate = new Date();

      switch (period) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setHours(0, 0, 0, 0);
      }

      const todayTransactions = (driver.transactions || []).filter(
        (t) => t.createdAt >= startDate && t.createdAt <= endDate,
      );

      const todayRides = (driver.rides || []).filter(
        (r) =>
          r.createdAt >= startDate &&
          r.createdAt <= endDate &&
          r.status === RideStatus.COMPLETED,
      );

      const earnings = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const trips = todayRides.length;
      const onlineHours = 5.5; // Default for now, will be calculated from session logs
      const acceptanceRate = 92; // Default for now, will be calculated from ride requests

      res.status(200).json({
        success: true,
        data: {
          earnings,
          trips,
          onlineHours,
          acceptanceRate,
          rating: driver.rating,
        },
      });
    } catch (error) {
      console.error("Error fetching driver stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch driver stats",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }

  // Get driver ride requests
  static async getRideRequests(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status = "pending" } = req.query;

      const driver = await driverRepository.findOne({
        where: { id: parseInt(id as string) },
      });

      if (!driver) {
        return res.status(404).json({
          success: false,
          message: "Driver not found",
        });
      }

      // Get pending ride requests for this driver
      const rides = await rideRepository.find({
        where: {
          status:
            status === "pending" ? RideStatus.BOOKED : RideStatus.IN_PROGRESS,
        },
        relations: ["user", "driver"],
        order: { createdAt: "DESC" },
      });

      const rideRequests = rides.map((ride) => ({
        id: ride.id,
        passengerName: ride.user.fullName,
        passengerAvatar:
          ride.user.selfieImage || "https://via.placeholder.com/100",
        passengerRating: 4.5, // Default for now
        pickupLocation: ride.origin,
        dropoffLocation: ride.destination,
        distance: ride.distanceKm,
        duration: ride.durationMinutes,
        fare: ride.fare,
        paymentMethod: "Wallet",
        seats: 1,
        timestamp: ride.createdAt,
        status: ride.status,
      }));

      res.status(200).json({
        success: true,
        data: rideRequests,
      });
    } catch (error) {
      console.error("Error fetching ride requests:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch ride requests",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      });
    }
  }
}