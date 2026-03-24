import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { API_URL } from "@/constants/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Expo Router will ignore this file
// @expo-router/ignore

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  deletedByUser?: boolean; // Track if user deleted this notification
};

interface NotificationProviderProps {
  children: React.ReactNode;
  api_url: string;
}

type NotificationContextValue = {
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  addNotification: (title: string, message: string) => void;
  restoreDeletedNotifications: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  fetchNotifications: async () => {},
  addNotification: () => {},
  restoreDeletedNotifications: async () => {},
  clearAllNotifications: async () => {},
});

export const NotificationProvider = ({
  children,
  api_url,
}: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const clearAllNotifications = async () => {
    try {
      setNotifications([]);
      await saveNotificationsToStorage([]);
      if (user) {
        await fetch(`${api_url}/api/notifications/clear-all`, {
          method: "DELETE",
          headers: {
            "x-user-id": user.id,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    }
  };
  const STORAGE_KEY = `@notifications_${user?.id || "guest"}`;

  const saveNotificationsToStorage = async (notifications: Notification[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notifications to storage:", error);
    }
  };

  const loadNotificationsFromStorage = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load notifications from storage:", error);
    }
    return [];
  };

  const addNotification = (title: string, message: string) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => {
      const updated = [newNotification, ...prev];
      saveNotificationsToStorage(updated);
      return updated;
    });
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    // Set up polling interval (30 seconds)
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, [user?.id, api_url]);

  const fetchNotifications = async () => {
    if (user) {
      try {
        // Load existing local notifications first
        const localNotifications = await loadNotificationsFromStorage();

        // Fetch from server
        const response = await fetch(
          `${api_url}/api/notifications/notifications`,
          {
            headers: {
              "x-user-id": user.id,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          const serverNotifications = await response.json();

          // Merge server notifications with local ones, preserving user-deleted ones
          // Filter out notifications that user has deleted locally
          const validLocalNotifications = localNotifications.filter(
            (local) =>
              serverNotifications.some((server) => server.id === local.id) ||
              !local.deletedByUser, // Keep locally created notifications
          );

          // Merge server notifications with local ones
          const mergedNotifications = [...serverNotifications];

          // Add local notifications that don't exist on server (user-created or preserved)
          validLocalNotifications.forEach((local) => {
            if (!mergedNotifications.some((server) => server.id === local.id)) {
              mergedNotifications.push(local);
            }
          });

          // Sort by created date (newest first)
          mergedNotifications.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          setNotifications(mergedNotifications);
          saveNotificationsToStorage(mergedNotifications);
        } else {
          // If server fails, use local notifications
          setNotifications(localNotifications);
          console.error(
            `Failed to fetch notifications. Status: ${response.status}`,
          );
        }
      } catch (error) {
        console.error("Failed to fetch notifications.", error);
        // On error, fall back to local notifications
        const localNotifications = await loadNotificationsFromStorage();
        setNotifications(localNotifications);
      }
    }
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `${api_url}/api/notifications/notifications/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-user-id": user.id,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.ok) {
        setNotifications((prev) => {
          const updated = prev.filter((n) => n.id !== id);
          saveNotificationsToStorage(updated);
          return updated;
        });
      }
    } catch (e) {
      console.error("Failed to delete notification", e);
    }
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(
        `${api_url}/api/notifications/notifications/${id}/read`,
        {
          method: "PUT",
          headers: {
            "x-user-id": user.id,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.ok) {
        setNotifications((prev) => {
          const updated = prev.map((n) =>
            n.id === id ? { ...n, isRead: true } : n,
          );
          saveNotificationsToStorage(updated);
          return updated;
        });
      }
    } catch (e) {
      console.error("Failed to mark notification as read", e);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${api_url}/api/notifications/read-all`, {
        method: "PUT",
        headers: {
          "x-user-id": user.id,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        setNotifications((prev) => {
          const updated = prev.map((n) => ({ ...n, isRead: true }));
          saveNotificationsToStorage(updated);
          return updated;
        });
      }
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };

  const restoreDeletedNotifications = async () => {
    // For now, re-fetching from server is the best way to "restore"
    await fetchNotifications();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
        addNotification,
        restoreDeletedNotifications,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
