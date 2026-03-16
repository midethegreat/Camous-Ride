import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";
import { User } from "../entities/User";

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const notificationRepository = AppDataSource.getRepository(Notification);
    const notifications = await notificationRepository.find({
      where: { user: { id: userId } },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    // Transform notifications to match frontend expectations
    const transformedNotifications = notifications.map((notif) => ({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      isRead: notif.isRead,
      createdAt: notif.createdAt,
    }));

    res.json(transformedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const notificationId = Array.isArray(req.params.notificationId)
      ? req.params.notificationId[0]
      : req.params.notificationId;

    const notificationRepository = AppDataSource.getRepository(Notification);
    const notification = await notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
      relations: ["user"],
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notificationRepository.save(notification);

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    const notificationRepository = AppDataSource.getRepository(Notification);
    await notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res
      .status(500)
      .json({ message: "Error marking all notifications as read" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const notificationId = Array.isArray(req.params.notificationId)
      ? req.params.notificationId[0]
      : req.params.notificationId;

    const notificationRepository = AppDataSource.getRepository(Notification);
    const result = await notificationRepository.delete({
      id: notificationId,
      user: { id: userId },
    });

    if (result.affected === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ message: "Error deleting notification" });
  }
};
