import { Router } from "express";
import { DriverController } from "../controllers/driverController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Public routes
router.get("/nearby", DriverController.getNearbyDrivers);

// Protected routes
router.use(authenticateToken);

// Driver management routes
router.get("/", DriverController.getAllDrivers);
router.post("/profile", DriverController.createDriverProfile);
router.get("/:id", DriverController.getDriverById);
router.put("/:id/status", DriverController.updateDriverStatus);
router.put("/:id/location", DriverController.updateDriverLocation);
router.post("/:id/accept-ride", DriverController.acceptRide);
router.get("/:id/earnings", DriverController.getDriverEarnings);

// Rider app specific routes
router.get("/:id/profile", DriverController.getDriverProfile);
router.get("/:id/stats", DriverController.getDriverStats);
router.get("/:id/ride-requests", DriverController.getRideRequests);

export default router;
