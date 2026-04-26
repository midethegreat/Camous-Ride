import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  MapPin,
  DollarSign,
  Star,
  Trash2,
  Settings,
  Filter,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Notification {
  id: string;
  type: "order" | "message" | "payment" | "rating" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "high" | "medium" | "low";
  action?: {
    type: "accept" | "reject" | "view" | "call" | "reply";
    label: string;
  };
  metadata?: {
    orderId?: string;
    amount?: number;
    customerName?: string;
    rating?: number;
    location?: string;
  };
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    title: "New Order Received",
    message:
      "Order #ORD-2024-001 from John Doe\nJollof Rice with Chicken (₦3,500)",
    timestamp: "2 min ago",
    isRead: false,
    priority: "high",
    action: { type: "view", label: "View Order" },
    metadata: {
      orderId: "ORD-2024-001",
      customerName: "John Doe",
      amount: 3500,
    },
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    message: 'Sarah: "Can you deliver to Block B instead?"',
    timestamp: "5 min ago",
    isRead: false,
    priority: "medium",
    action: { type: "reply", label: "Reply" },
    metadata: {
      customerName: "Sarah",
    },
  },
  {
    id: "3",
    type: "payment",
    title: "Payment Received",
    message:
      "₦3,500 received for Order #ORD-2024-001\nPayment method: Transfer",
    timestamp: "10 min ago",
    isRead: true,
    priority: "medium",
    metadata: {
      orderId: "ORD-2024-001",
      amount: 3500,
    },
  },
  {
    id: "4",
    type: "rating",
    title: "New Rating",
    message: 'Mike gave you 5 stars!\n"Great food and fast delivery!"',
    timestamp: "15 min ago",
    isRead: true,
    priority: "low",
    metadata: {
      customerName: "Mike",
      rating: 5,
    },
  },
  {
    id: "5",
    type: "system",
    title: "System Update",
    message: "Your vendor profile has been verified successfully",
    timestamp: "1 hour ago",
    isRead: true,
    priority: "low",
  },
  {
    id: "6",
    type: "order",
    title: "Order Ready for Pickup",
    message: "Order #ORD-2024-002 is ready\nCustomer: Jane Smith",
    timestamp: "2 hours ago",
    isRead: true,
    priority: "high",
    action: { type: "view", label: "View Details" },
    metadata: {
      orderId: "ORD-2024-002",
      customerName: "Jane Smith",
    },
  },
  {
    id: "7",
    type: "message",
    title: "Delivery Update",
    message: "Rider is 5 minutes away with your order #ORD-2024-003",
    timestamp: "3 hours ago",
    isRead: true,
    priority: "medium",
    action: { type: "call", label: "Call Rider" },
    metadata: {
      orderId: "ORD-2024-003",
    },
  },
];

const notificationIcons = {
  order: Package,
  message: MessageCircle,
  payment: DollarSign,
  rating: Star,
  system: Bell,
};

const priorityColors = {
  high: Colors.red,
  medium: Colors.yellow,
  low: Colors.green,
};

export default function VendorNotifications() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filterType, setFilterType] = useState<
    "all" | "order" | "message" | "payment" | "rating" | "system"
  >("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    // Simulate real-time notifications
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "order",
        title: "New Order Alert",
        message: "New order received from customer",
        timestamp: "Just now",
        isRead: false,
        priority: "high",
        action: { type: "view", label: "View" },
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
    }, 30000); // Add new notification every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    const typeMatch = filterType === "all" || notification.type === filterType;
    const readMatch = !showUnreadOnly || !notification.isRead;
    return typeMatch && readMatch;
  });

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
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setNotifications((prev) =>
              prev.filter((notification) => notification.id !== notificationId),
            );
          },
        },
      ],
    );
  };

  const handleNotificationAction = (notification: Notification) => {
    markAsRead(notification.id);

    switch (notification.action?.type) {
      case "view":
        if (notification.metadata?.orderId) {
          router.push(
            `/vendor-dashboard/orders?orderId=${notification.metadata.orderId}`,
          );
        }
        break;
      case "reply":
        router.push("/vendor-dashboard/chat");
        break;
      case "call":
        Alert.alert("Call", "Calling customer...");
        break;
      case "accept":
      case "reject":
        Alert.alert("Action", `${notification.action?.label} action triggered`);
        break;
      default:
        break;
    }
  };

  const renderNotification = (notification: Notification) => {
    const IconComponent = notificationIcons[notification.type];
    const priorityColor = priorityColors[notification.priority];

    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification,
        ]}
        onPress={() => markAsRead(notification.id)}
        activeOpacity={0.8}
      >
        <View style={styles.notificationLeft}>
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: priorityColor + "20" },
            ]}
          >
            <IconComponent size={20} color={priorityColor} />
          </View>
          {!notification.isRead && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text style={styles.notificationTitle}>{notification.title}</Text>
            <Text style={styles.notificationTime}>
              {notification.timestamp}
            </Text>
          </View>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          {notification.metadata && (
            <View style={styles.metadataContainer}>
              {notification.metadata.orderId && (
                <View style={styles.metadataItem}>
                  <Package size={12} color={Colors.gray} />
                  <Text style={styles.metadataText}>
                    {notification.metadata.orderId}
                  </Text>
                </View>
              )}
              {notification.metadata.amount && (
                <View style={styles.metadataItem}>
                  <DollarSign size={12} color={Colors.primary} />
                  <Text style={styles.metadataText}>
                    ₦{notification.metadata.amount.toLocaleString()}
                  </Text>
                </View>
              )}
              {notification.metadata.customerName && (
                <View style={styles.metadataItem}>
                  <Text style={styles.metadataText}>
                    👤 {notification.metadata.customerName}
                  </Text>
                </View>
              )}
              {notification.metadata.rating && (
                <View style={styles.metadataItem}>
                  <Star size={12} color={Colors.yellow} />
                  <Text style={styles.metadataText}>
                    {notification.metadata.rating}/5
                  </Text>
                </View>
              )}
            </View>
          )}
          {notification.action && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleNotificationAction(notification)}
            >
              <Text style={styles.actionButtonText}>
                {notification.action.label}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteNotification(notification.id)}
        >
          <Trash2 size={16} color={Colors.gray} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <Filter size={20} color={Colors.dark} />
          </TouchableOpacity>
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterBarContent}
      >
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterType === "all" && styles.filterButtonActive,
          ]}
          onPress={() => setFilterType("all")}
        >
          <Text
            style={[
              styles.filterButtonText,
              filterType === "all" && styles.filterButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {Object.entries(notificationIcons).map(([type, Icon]) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filterType === type && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(type as any)}
          >
            <Icon
              size={14}
              color={filterType === type ? Colors.white : Colors.gray}
            />
            <Text
              style={[
                styles.filterButtonText,
                filterType === type && styles.filterButtonTextActive,
              ]}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Unread Toggle */}
      <View style={styles.unreadToggle}>
        <Text style={styles.unreadToggleText}>Show unread only</Text>
        <TouchableOpacity
          style={[
            styles.toggleSwitch,
            showUnreadOnly && styles.toggleSwitchActive,
          ]}
          onPress={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <View
            style={[
              styles.toggleThumb,
              showUnreadOnly && styles.toggleThumbActive,
            ]}
          />
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notificationsList}
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color={Colors.lightGray} />
            <Text style={styles.emptyStateText}>No notifications</Text>
            <Text style={styles.emptyStateSubtext}>
              {showUnreadOnly
                ? "You have no unread notifications"
                : "You're all caught up!"}
            </Text>
          </View>
        ) : (
          filteredNotifications.map(renderNotification)
        )}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Notifications</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <XCircle size={24} color={Colors.gray} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Notification Type</Text>
                {Object.entries(notificationIcons).map(([type, Icon]) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterOption,
                      filterType === type && styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      setFilterType(type as any);
                      setShowFilterModal(false);
                    }}
                  >
                    <Icon
                      size={18}
                      color={filterType === type ? Colors.primary : Colors.gray}
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterType === type && styles.filterOptionTextActive,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Priority</Text>
                {["high", "medium", "low"].map((priority) => (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.filterOption,
                      filterType === priority && styles.filterOptionActive,
                    ]}
                    onPress={() => {
                      setFilterType(priority as any);
                      setShowFilterModal(false);
                    }}
                  >
                    <View
                      style={[
                        styles.priorityIndicator,
                        {
                          backgroundColor:
                            priorityColors[
                              priority as keyof typeof priorityColors
                            ],
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.filterOptionText,
                        filterType === priority &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}{" "}
                      Priority
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },
  unreadBadge: {
    backgroundColor: Colors.red,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  unreadBadgeText: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  markAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  filterBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterBarContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  unreadToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  unreadToggleText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "500",
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.lightGray,
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
  notificationsList: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginVertical: 4,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unreadNotification: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  notificationLeft: {
    marginRight: 12,
    alignItems: "center",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
    marginTop: 4,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.gray,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 8,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metadataText: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "500",
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  actionButtonText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: "500",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.gray,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.lightGray,
    textAlign: "center",
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },
  filterSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  filterOptionActive: {
    backgroundColor: Colors.primaryLight,
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.gray,
  },
  filterOptionTextActive: {
    color: Colors.primary,
    fontWeight: "500",
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
