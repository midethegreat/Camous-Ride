import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  Alert,
  Platform,
  ActionSheetIOS,
} from "react-native";
import { Bell, Check, Trash2, Filter, X } from "lucide-react-native";
import { Colors } from "@/constants/color";
import CustomHeader from "@/components/CustomHeader";
import { riderApiService } from "@/services/riderApi";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "ride" | "payment";
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  onActionPress?: () => void;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "ride" | "payment">(
    "all",
  );
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());

  const driverId = "1"; // This should come from auth context

  useEffect(() => {
    // Load notifications on component mount
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // Fetch notifications from API
      const apiNotifications =
        await riderApiService.getDriverNotifications(driverId);

      // Transform API data to match our interface
      const transformedNotifications: Notification[] = apiNotifications.map(
        (notif: any) => ({
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type || "info",
          timestamp: new Date(notif.timestamp),
          isRead: notif.isRead || false,
          actionUrl: notif.actionUrl,
          onActionPress: notif.actionUrl
            ? () => console.log("Action pressed:", notif.actionUrl)
            : undefined,
        }),
      );

      setNotifications(transformedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);

      // Fallback to mock data if API fails
      const mockNotifications: Notification[] = [
        {
          id: "1",
          title: "New Ride Request",
          message: "You have a new ride request from Victoria Island to Ikeja",
          type: "ride",
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          isRead: false,
          onActionPress: () => console.log("Accept ride"),
        },
        {
          id: "2",
          title: "Payment Received",
          message:
            "₦2,500 has been credited to your account for completed ride",
          type: "payment",
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false,
        },
        {
          id: "3",
          title: "Document Verification",
          message: "Your driver license has been verified successfully",
          type: "success",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true,
        },
        {
          id: "4",
          title: "Peak Hours Alert",
          message: "High demand expected in your area. Go online to earn more!",
          type: "warning",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          isRead: true,
        },
        {
          id: "5",
          title: "System Update",
          message:
            "New features available. Update your app for better experience",
          type: "info",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          isRead: true,
        },
      ];
      setNotifications(mockNotifications);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications();
    } catch (err) {
      console.error("Error refreshing notifications:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true })),
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId),
    );
  };

  const deleteSelectedNotifications = () => {
    setNotifications((prev) =>
      prev.filter(
        (notification) => !selectedNotifications.has(notification.id),
      ),
    );
    setSelectedNotifications(new Set());
    setIsSelectionMode(false);
  };

  const toggleSelection = (notificationId: string) => {
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(notificationId)) {
      newSelected.delete(notificationId);
    } else {
      newSelected.add(notificationId);
    }
    setSelectedNotifications(newSelected);
  };

  const showFilterOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "All", "Unread", "Ride", "Payment"],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          const filters = ["all", "unread", "ride", "payment"];
          setFilter(filters[buttonIndex - 1] as any);
        },
      );
    } else {
      Alert.alert("Filter Notifications", "Choose filter type", [
        { text: "Cancel", style: "cancel" },
        { text: "All", onPress: () => setFilter("all") },
        { text: "Unread", onPress: () => setFilter("unread") },
        { text: "Ride", onPress: () => setFilter("ride") },
        { text: "Payment", onPress: () => setFilter("payment") },
      ]);
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "ride":
        return "🚗";
      case "payment":
        return "💰";
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      default:
        return "📢";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "ride":
        return Colors.primary;
      case "payment":
        return Colors.success;
      case "warning":
        return Colors.warning;
      case "success":
        return Colors.success;
      default:
        return Colors.primary;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.isRead;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Notifications" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={showFilterOptions}
            >
              <Filter size={20} color={Colors.primary} />
            </TouchableOpacity>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={markAllAsRead}
              >
                <Check size={16} color={Colors.success} />
                <Text style={styles.markAllText}>Mark all</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsText}>
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "No unread notifications"}
          </Text>
          {filteredNotifications.length > 0 && (
            <Text style={styles.statsText}>
              {filteredNotifications.length} total
            </Text>
          )}
        </View>
      </View>

      {filteredNotifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Bell size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyText}>
            {filter === "unread"
              ? "You have no unread notifications"
              : "You have no notifications yet"}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationItem,
                !notification.isRead && styles.unreadNotification,
                isSelectionMode &&
                  selectedNotifications.has(notification.id) &&
                  styles.selectedNotification,
              ]}
              onPress={() => {
                if (isSelectionMode) {
                  toggleSelection(notification.id);
                } else {
                  markAsRead(notification.id);
                  if (notification.onActionPress) {
                    notification.onActionPress();
                  }
                }
              }}
              onLongPress={() => {
                setIsSelectionMode(true);
                toggleSelection(notification.id);
              }}
            >
              <View style={styles.notificationLeft}>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor:
                        getNotificationColor(notification.type) + "20",
                    },
                  ]}
                >
                  <Text style={styles.iconText}>
                    {getNotificationIcon(notification.type)}
                  </Text>
                </View>
                <View style={styles.notificationContent}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !notification.isRead && styles.unreadTitle,
                    ]}
                  >
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
              </View>

              {!notification.isRead && !isSelectionMode && (
                <View style={styles.unreadDot} />
              )}

              {isSelectionMode && (
                <View
                  style={[
                    styles.selectionCircle,
                    selectedNotifications.has(notification.id) &&
                      styles.selectedCircle,
                  ]}
                >
                  {selectedNotifications.has(notification.id) && (
                    <Check size={16} color={Colors.white} />
                  )}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {isSelectionMode && (
        <View style={styles.selectionBar}>
          <TouchableOpacity
            style={styles.selectionButton}
            onPress={() => {
              setSelectedNotifications(new Set());
              setIsSelectionMode(false);
            }}
          >
            <X size={20} color={Colors.text} />
            <Text style={styles.selectionButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.selectionCount}>
            {selectedNotifications.size} selected
          </Text>

          <TouchableOpacity
            style={[styles.selectionButton, styles.deleteButton]}
            onPress={deleteSelectedNotifications}
          >
            <Trash2 size={20} color={Colors.error} />
            <Text style={[styles.selectionButtonText, styles.deleteButtonText]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary + "15",
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.success + "15",
  },
  markAllText: {
    fontSize: 14,
    color: Colors.success,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statsText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.backgroundCard,
  },
  unreadNotification: {
    backgroundColor: Colors.primary + "05",
  },
  selectedNotification: {
    backgroundColor: Colors.primary + "10",
  },
  notificationLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 18,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  unreadTitle: {
    fontWeight: "700",
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.textMuted,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCircle: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  selectionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  selectionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectionButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: "500",
  },
  selectionCount: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: Colors.error + "15",
  },
  deleteButtonText: {
    color: Colors.error,
  },
});
