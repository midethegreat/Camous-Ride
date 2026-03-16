import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController";

const router = express.Router();

// Simple authentication middleware using user ID from header
const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  const userId = req.headers["x-user-id"] as string;

  if (!userId) {
    return res.status(401).json({ message: "No user ID provided" });
  }

  // Add user ID to request for use in controllers
  (req as any).userId = userId;
  next();
};

router.use(authenticate);

router.get("/notifications", getNotifications);
router.put("/notifications/:notificationId/read", markAsRead);
router.put("/notifications/read-all", markAllAsRead);
router.delete("/notifications/:notificationId", deleteNotification);

export default router;
