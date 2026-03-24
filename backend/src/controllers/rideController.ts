import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Ride, RideStatus } from "../entities/Ride";
import { User } from "../entities/User";
import { Driver } from "../entities/Driver";
import { DriverStatus } from "../entities/Driver";
import {
  Transaction,
  TransactionType,
  TransactionStatus,
} from "../entities/Transaction";
import {
  sendNotification,
  sendToUser,
  broadcastToDrivers,
} from "../notificationService";
import { sendRideUpdate } from "../services/twilioService";
import { checkAndApplyRewardTier } from "../services/rewardService";
import {
  calculateFare,
  calculateCommission,
  FARE_CONFIG,
} from "../services/fareService";
import { isSuspiciousRide } from "../services/fraudService";

const rideRepository = AppDataSource.getRepository(Ride);
const userRepository = AppDataSource.getRepository(User);
const driverRepository = AppDataSource.getRepository(Driver);
const transactionRepository = AppDataSource.getRepository(Transaction);

// Book a new ride
export const bookRide = async (req: Request, res: Response) => {
  const { userId, origin, destination, distanceKm, durationMinutes, driverId } =
    req.body;

  if (!userId || !origin || !destination) {
    return res.status(400).json({
      message: "Missing required fields: userId, origin, destination.",
    });
  }

  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let driver: Driver | undefined = undefined;
    if (driverId) {
      const foundDriver = await driverRepository.findOne({
        where: { id: parseInt(driverId) },
        relations: ["user"],
      });

      if (!foundDriver) {
        return res.status(404).json({ message: "Driver not found." });
      }
      driver = foundDriver;

      // Check if driver can accept rides
      if (!driver.canAcceptRide()) {
        return res
          .status(400)
          .json({ message: "Driver is not available to accept rides." });
      }
    }

    // Backend calculated fare
    const now = new Date();
    const hours = now.getHours();
    const isNight = hours >= 21 || hours <= 5;
    const isSurge = false; // In a real system, would be calculated from demand

    // Check if ride is within campus
    // For now, we assume all rides starting/ending on campus are COLISDAV rides
    // This can be refined with geofencing logic later
    const isCOLISDAVRide = true;

    const fare = calculateFare(
      {
        distanceKm: distanceKm || 0,
        durationMinutes: durationMinutes || 0,
        isNight,
        isSurge,
      },
      isCOLISDAVRide,
    );

    if (user.walletBalance < fare) {
      return res
        .status(400)
        .json({ message: "Insufficient wallet balance to book this ride." });
    }

    const ride = new Ride();
    ride.user = user;
    ride.driver = driver;
    ride.origin = origin;
    ride.destination = destination;
    ride.fare = fare;
    ride.distanceKm = distanceKm;
    ride.durationMinutes = durationMinutes;
    ride.startedAt = new Date();
    ride.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    await rideRepository.save(ride);

    // Update driver status if driver was assigned
    if (driver) {
      driver.status = DriverStatus.ON_RIDE;
      await driverRepository.save(driver);
    }

    console.log(
      `Ride booked for user ${user.email} from ${origin} to ${destination} with fare ${fare}`,
    );
    return res.status(201).json({ message: "Ride booked successfully.", ride });
  } catch (error) {
    console.error("Error booking ride:", error);
    return res.status(500).json({ message: "Failed to book ride." });
  }
};

// Request a ride with real-time driver matching
export const requestRide = async (req: Request, res: Response) => {
  const {
    userId,
    pickup,
    destination,
    passengers,
    paymentMethod,
    voucherCode,
    estimatedFare,
  } = req.body;

  if (!userId || !pickup || !destination || !estimatedFare) {
    return res.status(400).json({
      message:
        "Missing required fields: userId, pickup, destination, estimatedFare.",
    });
  }

  try {
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Check wallet balance
    if (user.walletBalance < estimatedFare) {
      return res.status(400).json({ message: "Insufficient wallet balance." });
    }

    // Find available drivers within 5km radius
    const availableDrivers = await driverRepository
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
          lat: pickup.lat,
          lng: pickup.lng,
          radius: 5, // 5km radius
        },
      )
      .getMany();

    // Create ride request
    const ride = new Ride();
    ride.user = user;
    ride.origin = JSON.stringify(pickup);
    ride.destination = JSON.stringify(destination);
    ride.fare = estimatedFare;
    ride.status = RideStatus.BOOKED;
    ride.startedAt = new Date();
    ride.verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    await rideRepository.save(ride);

    // Notify available drivers in real-time
    const rideRequestData = {
      rideId: ride.id,
      pickup,
      destination,
      fare: estimatedFare,
      passengers,
      distance: 0, // Will be calculated by driver app
      estimatedDuration: 0, // Will be calculated by driver app
      user: {
        id: user.id,
        name: user.fullName,
        phoneNumber: user.phoneNumber,
        rating: 5, // Default rating
      },
      timestamp: new Date().toISOString(),
    };

    // Broadcast to all available drivers
    broadcastToDrivers("new_ride_request", rideRequestData);

    // Set timeout to cancel ride if no driver accepts
    setTimeout(async () => {
      const updatedRide = await rideRepository.findOne({
        where: { id: ride.id },
      });
      if (updatedRide && updatedRide.status === RideStatus.BOOKED) {
        updatedRide.status = RideStatus.CANCELLED;
        await rideRepository.save(updatedRide);

        // Notify user that no driver accepted
        sendToUser(
          user.id,
          "ride_timeout",
          {
            rideId: ride.id,
            message: "No drivers accepted your ride request. Please try again.",
          },
          "user",
        );
      }
    }, 30000); // 30 seconds timeout

    return res.status(201).json({
      message: "Ride request sent to nearby drivers.",
      ride,
      availableDrivers: availableDrivers.length,
    });
  } catch (error) {
    console.error("Error requesting ride:", error);
    return res.status(500).json({ message: "Failed to request ride." });
  }
};

// Get ride details
export const getRide = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  try {
    const ride = await rideRepository.findOne({
      where: { id },
      relations: ["user", "driver", "driver.user"],
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    return res.status(200).json({ ride });
  } catch (error) {
    console.error("Error fetching ride:", error);
    return res.status(500).json({ message: "Failed to fetch ride." });
  }
};

// Get user's rides
export const getUserRides = async (req: Request, res: Response) => {
  const userId = String(req.params.userId);

  try {
    const rides = await rideRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "driver", "driver.user"],
      order: { createdAt: "DESC" },
    });

    return res.status(200).json({ rides });
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return res.status(500).json({ message: "Failed to fetch user rides." });
  }
};

// Get driver's rides
export const getDriverRides = async (req: Request, res: Response) => {
  const driverId = parseInt(String(req.params.driverId));

  try {
    const rides = await rideRepository.find({
      where: { driver: { id: driverId } },
      relations: ["user", "driver", "driver.user"],
      order: { createdAt: "DESC" },
    });

    return res.status(200).json({ rides });
  } catch (error) {
    console.error("Error fetching driver rides:", error);
    return res.status(500).json({ message: "Failed to fetch driver rides." });
  }
};

// Update ride status
export const updateRideStatus = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { status } = req.body;

  try {
    const ride = await rideRepository.findOne({
      where: { id },
      relations: ["user", "driver", "driver.user"],
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    ride.status = status;

    if (status === RideStatus.COMPLETED) {
      ride.completedAt = new Date();

      // Update driver status back to available
      if (ride.driver) {
        ride.driver.status = DriverStatus.ONLINE;
        ride.driver.isAvailable = true;
        await driverRepository.save(ride.driver);
      }

      // Process payment
      const transaction = new Transaction();
      transaction.user = ride.user;
      transaction.amount = ride.fare;
      transaction.type = TransactionType.PAYMENT;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.reference = `ride-${ride.id}`;

      await transactionRepository.save(transaction);

      // Update user balance
      ride.user.walletBalance -= ride.fare;
      await userRepository.save(ride.user);

      // Update driver earnings if driver exists
      if (ride.driver) {
        const commission = calculateCommission(ride.fare);
        const driverEarnings = ride.fare - commission;

        ride.driver.earnings += driverEarnings;
        ride.driver.totalRides += 1;
        await driverRepository.save(ride.driver);

        // Update driver's user balance
        ride.driver.user.earnedBalance += driverEarnings;
        await userRepository.save(ride.driver.user);
      }
    }

    await rideRepository.save(ride);

    // Send notifications
    if (status === RideStatus.COMPLETED) {
      sendToUser(
        ride.user.id,
        "ride_completed",
        {
          rideId: ride.id,
          fare: ride.fare,
          message: "Your ride has been completed successfully!",
        },
        "user",
      );
    }

    return res.status(200).json({
      message: "Ride status updated successfully.",
      ride,
    });
  } catch (error) {
    console.error("Error updating ride status:", error);
    return res.status(500).json({ message: "Failed to update ride status." });
  }
};

// Cancel ride
export const cancelRide = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { reason } = req.body;

  try {
    const ride = await rideRepository.findOne({
      where: { id },
      relations: ["user", "driver", "driver.user"],
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    if (ride.status === RideStatus.COMPLETED) {
      return res.status(400).json({ message: "Cannot cancel completed ride." });
    }

    ride.status = RideStatus.CANCELLED;

    // Update driver status back to available if driver was assigned
    if (ride.driver) {
      ride.driver.status = DriverStatus.ONLINE;
      ride.driver.isAvailable = true;
      await driverRepository.save(ride.driver);
    }

    await rideRepository.save(ride);

    // Send notifications
    if (ride.driver) {
      sendToUser(
        ride.driver.user.id,
        "ride_cancelled",
        {
          rideId: ride.id,
          reason: reason || "Ride cancelled by user",
        },
        "driver",
      );
    }

    return res.status(200).json({
      message: "Ride cancelled successfully.",
      ride,
    });
  } catch (error) {
    console.error("Error cancelling ride:", error);
    return res.status(500).json({ message: "Failed to cancel ride." });
  }
};

// Get rides by user ID
export const getRidesByUser = async (req: Request, res: Response) => {
  const userId = String(req.params.userId);

  try {
    const rides = await rideRepository.find({
      where: { user: { id: userId } },
      relations: ["user", "driver", "driver.user"],
      order: { createdAt: "DESC" },
    });

    return res.status(200).json({ rides });
  } catch (error) {
    console.error("Error fetching user rides:", error);
    return res.status(500).json({ message: "Failed to fetch user rides." });
  }
};

// Complete a ride
export const completeRide = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { finalDistance, finalDuration, finalFare } = req.body;

  try {
    const ride = await rideRepository.findOne({
      where: { id },
      relations: ["user", "driver", "driver.user"],
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    if (ride.status !== RideStatus.IN_PROGRESS) {
      return res.status(400).json({ message: "Ride is not in progress." });
    }

    ride.status = RideStatus.COMPLETED;
    ride.completedAt = new Date();

    if (finalDistance) ride.distanceKm = finalDistance;
    if (finalDuration) ride.durationMinutes = finalDuration;
    if (finalFare) ride.fare = finalFare;

    // Update driver status
    if (ride.driver) {
      ride.driver.status = DriverStatus.ONLINE;
      ride.driver.isAvailable = true;
      await driverRepository.save(ride.driver);
    }

    await rideRepository.save(ride);

    // Process payment and commission
    const commission = calculateCommission(ride.fare);
    const driverEarnings = ride.fare - commission;

    // Create transaction for driver earnings
    const driverTransaction = new Transaction();
    driverTransaction.user = ride.driver!.user;
    driverTransaction.amount = driverEarnings;
    driverTransaction.type = TransactionType.DEPOSIT; // Earning is a deposit to wallet
    driverTransaction.status = TransactionStatus.COMPLETED;
    driverTransaction.reference = `earning-${ride.id}`;

    await transactionRepository.save(driverTransaction);

    // Send notifications
    sendToUser(
      ride.user.id,
      "ride_completed",
      { rideId: ride.id, fare: ride.fare },
      "user",
    );

    if (ride.user.phoneNumber) {
      await sendRideUpdate(
        ride.user.phoneNumber,
        "completed",
        `Your ride has been completed. Fare: ₦${ride.fare}. Thank you for using Camous-Ride!`,
      );
    }

    if (ride.driver) {
      sendToUser(
        ride.driver.user.id,
        "ride_completed",
        { rideId: ride.id, earnings: driverEarnings },
        "driver",
      );
    }

    return res.status(200).json({
      message: "Ride completed successfully.",
      ride,
      driverEarnings,
    });
  } catch (error) {
    console.error("Error completing ride:", error);
    return res.status(500).json({ message: "Failed to complete ride." });
  }
};

// Accept a ride request
export const acceptRide = async (req: Request, res: Response) => {
  const rideId = String(req.params.rideId);
  const { driverId } = req.body;

  try {
    const ride = await rideRepository.findOne({
      where: { id: rideId },
      relations: ["user", "driver"],
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    if (ride.status !== RideStatus.BOOKED) {
      return res
        .status(400)
        .json({ message: "Ride is not available for acceptance." });
    }

    const driver = await driverRepository.findOne({
      where: { id: driverId },
      relations: ["user"],
    });

    if (!driver) {
      return res.status(404).json({ message: "Driver not found." });
    }

    if (!driver.isAvailable || driver.status !== DriverStatus.ONLINE) {
      return res.status(400).json({ message: "Driver is not available." });
    }

    ride.driver = driver;
    ride.status = RideStatus.IN_PROGRESS;

    driver.status = DriverStatus.BUSY;
    driver.isAvailable = false;

    await rideRepository.save(ride);
    await driverRepository.save(driver);

    // Send notifications
    sendToUser(
      ride.user.id,
      "ride_accepted",
      { rideId: ride.id, driverName: driver.user.fullName },
      "user",
    );

    if (ride.user.phoneNumber) {
      await sendRideUpdate(
        ride.user.phoneNumber,
        "accepted",
        `Driver ${driver.user.fullName} is on their way to pick you up. Verification code: ${ride.verificationCode}`,
      );
    }

    sendToUser(driver.user.id, "ride_accepted", { rideId: ride.id }, "driver");

    return res.status(200).json({
      message: "Ride accepted successfully.",
      ride,
    });
  } catch (error) {
    console.error("Error accepting ride:", error);
    return res.status(500).json({ message: "Failed to accept ride." });
  }
};

// Rate and tip a ride
export const rateAndTipRide = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { rating, tip } = req.body;

  try {
    const ride = await rideRepository.findOne({
      where: { id },
      relations: ["user", "driver", "driver.user"],
    });

    if (!ride) {
      return res.status(404).json({ message: "Ride not found." });
    }

    if (ride.status !== RideStatus.COMPLETED) {
      return res.status(400).json({ message: "Ride is not completed." });
    }

    if (rating) {
      ride.rating = rating;
    }

    if (tip && tip > 0 && ride.driver) {
      ride.tip = tip;

      // Create tip transaction
      const tipTransaction = new Transaction();
      tipTransaction.user = ride.driver.user;
      tipTransaction.amount = tip;
      tipTransaction.type = TransactionType.DEPOSIT;
      tipTransaction.status = TransactionStatus.COMPLETED;
      tipTransaction.reference = `tip-${ride.id}`;

      await transactionRepository.save(tipTransaction);
    }

    await rideRepository.save(ride);

    // Update driver rating
    if (ride.driver && rating) {
      const driverRides = await rideRepository.find({
        where: {
          driver: { id: ride.driver.id },
          status: RideStatus.COMPLETED,
        },
      });

      const validRatings = driverRides
        .filter((r) => r.rating !== null && r.rating !== undefined)
        .map((r) => r.rating as number);
      if (validRatings.length > 0) {
        ride.driver.rating =
          validRatings.reduce((sum, r) => sum + r, 0) / validRatings.length;
        await driverRepository.save(ride.driver);
      }
    }

    // Send notification
    if (ride.driver && tip > 0) {
      sendToUser(
        ride.driver.user.id,
        "tip_received",
        { rideId: ride.id, tip, rating },
        "driver",
      );
    }

    return res.status(200).json({
      message: "Rating and tip updated successfully.",
      ride,
    });
  } catch (error) {
    console.error("Error rating ride:", error);
    return res.status(500).json({ message: "Failed to rate ride." });
  }
};

// Get fare estimate
export const getFareEstimate = async (req: Request, res: Response) => {
  const { origin, destination, distanceKm, durationMinutes, vehicleType } =
    req.query;

  try {
    if (!origin || !destination || !distanceKm || !durationMinutes) {
      return res.status(400).json({
        message:
          "Missing required parameters: origin, destination, distanceKm, durationMinutes",
      });
    }

    const distance = parseFloat(distanceKm as string);
    const duration = parseFloat(durationMinutes as string);

    if (isNaN(distance) || isNaN(duration)) {
      return res
        .status(400)
        .json({ message: "Invalid distance or duration values." });
    }

    const fare = calculateFare(
      {
        distanceKm: distance,
        durationMinutes: duration,
        isNight: false, // Default or determine from current time
        isSurge: false,
      },
      true,
    );
    const commission = calculateCommission(fare);
    const driverEarnings = fare - commission;

    return res.status(200).json({
      fare,
      commission,
      driverEarnings,
      breakdown: {
        baseFare: FARE_CONFIG.BASE_FARE,
        perKmRate: FARE_CONFIG.KM_RATE,
        perMinuteRate: FARE_CONFIG.MIN_RATE,
        distanceKm: distance,
        durationMinutes: duration,
      },
    });
  } catch (error) {
    console.error("Error calculating fare estimate:", error);
    return res
      .status(500)
      .json({ message: "Failed to calculate fare estimate." });
  }
};
