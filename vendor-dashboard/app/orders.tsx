import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Star,
  MessageCircle,
  Phone,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status:
    | "pending"
    | "accepted"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  timestamp: string;
  deliveryAddress?: string;
  notes?: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    customerName: "John Doe",
    customerPhone: "+234 801 234 5678",
    items: [
      { name: "Jollof Rice", quantity: 2, price: 1500 },
      { name: "Chicken", quantity: 2, price: 2000 },
    ],
    total: 7000,
    status: "pending",
    timestamp: "2 min ago",
    deliveryAddress: "Block A, Room 101",
    notes: "Extra spicy please",
  },
  {
    id: "ORD-002",
    customerName: "Jane Smith",
    customerPhone: "+234 802 345 6789",
    items: [
      { name: "Fried Rice", quantity: 1, price: 1200 },
      { name: "Fish", quantity: 1, price: 1800 },
    ],
    total: 3000,
    status: "accepted",
    timestamp: "5 min ago",
    deliveryAddress: "Block B, Room 205",
  },
  {
    id: "ORD-003",
    customerName: "Mike Johnson",
    customerPhone: "+234 803 456 7890",
    items: [
      { name: "Pounded Yam", quantity: 1, price: 1000 },
      { name: "Egusi Soup", quantity: 1, price: 1500 },
    ],
    total: 2500,
    status: "preparing",
    timestamp: "10 min ago",
    deliveryAddress: "Block C, Room 312",
  },
  {
    id: "ORD-004",
    customerName: "Sarah Wilson",
    customerPhone: "+234 804 567 8901",
    items: [
      { name: "Amala", quantity: 2, price: 800 },
      { name: "Ewedu Soup", quantity: 2, price: 1000 },
    ],
    total: 3600,
    status: "ready",
    timestamp: "15 min ago",
    deliveryAddress: "Block D, Room 408",
  },
];

const statusColors = {
  pending: Colors.yellow,
  accepted: Colors.primary,
  preparing: Colors.accent,
  ready: Colors.green,
  delivered: Colors.green,
  cancelled: Colors.red,
};

const statusIcons = {
  pending: Clock,
  accepted: CheckCircle,
  preparing: Package,
  ready: Truck,
  delivered: Star,
  cancelled: XCircle,
};

export default function OrdersDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(
    (order) => selectedStatus === "all" || order.status === selectedStatus,
  );

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  const handleAcceptOrder = (order: Order) => {
    Alert.alert(
      "Accept Order",
      `Accept order ${order.id} from ${order.customerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => updateOrderStatus(order.id, "accepted"),
        },
      ],
    );
  };

  const handleRejectOrder = (order: Order) => {
    Alert.alert(
      "Reject Order",
      `Reject order ${order.id} from ${order.customerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          onPress: () => updateOrderStatus(order.id, "cancelled"),
          style: "destructive",
        },
      ],
    );
  };

  const handleMarkReady = (order: Order) => {
    updateOrderStatus(order.id, "ready");
  };

  const handleCallCustomer = (phone: string) => {
    Alert.alert("Call Customer", `Call ${phone}?`);
  };

  const handleChatCustomer = (orderId: string) => {
    router.push(`/vendor-dashboard/chat?orderId=${orderId}`);
  };

  const renderOrderCard = (order: Order) => {
    const StatusIcon = statusIcons[order.status];

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() => setSelectedOrder(order)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.orderTime}>{order.timestamp}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColors[order.status] + "20" },
            ]}
          >
            <StatusIcon size={14} color={statusColors[order.status]} />
            <Text
              style={[styles.statusText, { color: statusColors[order.status] }]}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          <Text style={styles.deliveryAddress}>{order.deliveryAddress}</Text>
        </View>

        <View style={styles.itemsContainer}>
          {order.items.slice(0, 2).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                ₦{item.price * item.quantity}
              </Text>
            </View>
          ))}
          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              +{order.items.length - 2} more items
            </Text>
          )}
        </View>

        <View style={styles.orderFooter}>
          <Text style={styles.totalText}>
            Total: ₦{order.total.toLocaleString()}
          </Text>

          {order.status === "pending" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleRejectOrder(order)}
              >
                <XCircle size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAcceptOrder(order)}
              >
                <CheckCircle size={16} color={Colors.white} />
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          )}

          {order.status === "accepted" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.prepareButton]}
              onPress={() => updateOrderStatus(order.id, "preparing")}
            >
              <Package size={16} color={Colors.white} />
              <Text style={styles.actionButtonText}>Start Preparing</Text>
            </TouchableOpacity>
          )}

          {order.status === "preparing" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.readyButton]}
              onPress={() => handleMarkReady(order)}
            >
              <CheckCircle size={16} color={Colors.white} />
              <Text style={styles.actionButtonText}>Mark Ready</Text>
            </TouchableOpacity>
          )}

          {order.status === "ready" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.iconButton, styles.callButton]}
                onPress={() => handleCallCustomer(order.customerPhone)}
              >
                <Phone size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconButton, styles.chatButton]}
                onPress={() => handleChatCustomer(order.id)}
              >
                <MessageCircle size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const statusOptions = [
    { key: "all", label: "All Orders", count: orders.length },
    {
      key: "pending",
      label: "Pending",
      count: orders.filter((o) => o.status === "pending").length,
    },
    {
      key: "accepted",
      label: "Accepted",
      count: orders.filter((o) => o.status === "accepted").length,
    },
    {
      key: "preparing",
      label: "Preparing",
      count: orders.filter((o) => o.status === "preparing").length,
    },
    {
      key: "ready",
      label: "Ready",
      count: orders.filter((o) => o.status === "ready").length,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Status Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilter}
        contentContainerStyle={styles.statusFilterContent}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.statusFilterItem,
              selectedStatus === option.key && styles.statusFilterItemActive,
            ]}
            onPress={() => setSelectedStatus(option.key)}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === option.key && styles.statusFilterTextActive,
              ]}
            >
              {option.label} ({option.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Orders List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
      >
        {filteredOrders.map(renderOrderCard)}
        {filteredOrders.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={64} color={Colors.lightGray} />
            <Text style={styles.emptyStateText}>No orders found</Text>
            <Text style={styles.emptyStateSubtext}>
              Orders will appear here when customers place them
            </Text>
          </View>
        )}
      </ScrollView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },
  statusFilter: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  statusFilterItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusFilterItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  statusFilterText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: "500",
  },
  statusFilterTextActive: {
    color: Colors.white,
  },
  ordersList: {
    padding: 20,
    gap: 16,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
  },
  orderTime: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  customerInfo: {
    marginBottom: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  deliveryAddress: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 2,
  },
  itemsContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderTopColor: Colors.border,
    borderBottomColor: Colors.border,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  itemName: {
    fontSize: 14,
    color: Colors.dark,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "500",
  },
  moreItems: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  rejectButton: {
    backgroundColor: Colors.red,
  },
  prepareButton: {
    backgroundColor: Colors.accent,
  },
  readyButton: {
    backgroundColor: Colors.green,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.white,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  callButton: {},
  chatButton: {},
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
});
