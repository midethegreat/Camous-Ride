import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { API_URL } from "@/_constants/apiConfig";

// Expo Router will ignore this file
// @expo-router/ignore

type Notification = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
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
};

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  fetchNotifications: async () => {},
});

export const NotificationProvider = ({
  children,
  api_url,
}: NotificationProviderProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

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
          const data = await response.json();
          setNotifications(data);
        } else {
          console.error(
            `Failed to fetch notifications. Status: ${response.status}`,
          );
        }
      } catch (error) {
        console.error("Failed to fetch notifications.", error);
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
        setNotifications((prev) => prev.filter((n) => n.id !== id));
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
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
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
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error("Failed to mark all notifications as read", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id, api_url]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
