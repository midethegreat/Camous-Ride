import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  User,
  Phone,
  MapPin,
  DollarSign,
  Clock3,
  ChevronRight,
  Filter,
  AlertCircle,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  total: number;
  status:
    | "pending"
    | "accepted"
    | "preparing"
    | "ready"
    | "delivered"
    | "cancelled";
  orderTime: string;
  estimatedDelivery: string;
  paymentMethod: string;
  specialInstructions?: string;
}

export default function OrdersDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-001",
      customerName: "John Smith",
      customerPhone: "+1 234-567-8900",
      deliveryAddress: "Campus Dorm A, Room 204",
      items: [
        {
          id: "1",
          name: "Campus Burger",
          quantity: 2,
          price: 12.99,
          notes: "No onions on one",
        },
        { id: "2", name: "French Fries", quantity: 1, price: 3.99 },
        { id: "3", name: "Coca Cola", quantity: 2, price: 2.99 },
      ],
      total: 35.95,
      status: "pending",
      orderTime: "2:30 PM",
      estimatedDelivery: "3:15 PM",
      paymentMethod: "Card",
      specialInstructions: "Please deliver to front desk",
    },
    {
      id: "ORD-002",
      customerName: "Sarah Johnson",
      customerPhone: "+1 234-567-8901",
      deliveryAddress: "Library Study Room 3B",
      items: [
        { id: "4", name: "Student Pizza", quantity: 1, price: 18.99 },
        { id: "5", name: "Energy Smoothie", quantity: 1, price: 6.99 },
      ],
      total: 25.98,
      status: "preparing",
      orderTime: "2:15 PM",
      estimatedDelivery: "3:00 PM",
      paymentMethod: "Wallet",
    },
    {
      id: "ORD-003",
      customerName: "Mike Wilson",
      customerPhone: "+1 234-567-8902",
      deliveryAddress: "Science Building, Room 105",
      items: [
        { id: "6", name: "Chicken Sandwich", quantity: 1, price: 9.99 },
        { id: "7", name: "Iced Tea", quantity: 1, price: 2.99 },
      ],
      total: 12.98,
      status: "ready",
      orderTime: "2:00 PM",
      estimatedDelivery: "2:45 PM",
      paymentMethod: "Cash",
    },
    {
      id: "ORD-004",
      customerName: "Emma Davis",
      customerPhone: "+1 234-567-8903",
      deliveryAddress: "Student Center, 2nd Floor",
      items: [
        { id: "8", name: "Veggie Wrap", quantity: 2, price: 8.99 },
        { id: "9", name: "Apple Juice", quantity: 2, price: 3.49 },
      ],
      total: 24.96,
      status: "delivered",
      orderTime: "1:30 PM",
      estimatedDelivery: "2:15 PM",
      paymentMethod: "Card",
    },
  ]);

  const statusOptions = [
    { key: "all", label: "All Orders", color: Colors.gray },
    { key: "pending", label: "Pending", color: Colors.yellow },
    { key: "preparing", label: "Preparing", color: Colors.accent },
    { key: "ready", label: "Ready", color: Colors.primary },
    { key: "delivered", label: "Delivered", color: Colors.green },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} color={Colors.yellow} />;
      case "accepted":
      case "preparing":
        return <Clock3 size={16} color={Colors.accent} />;
      case "ready":
        return <CheckCircle size={16} color={Colors.primary} />;
      case "delivered":
        return <CheckCircle size={16} color={Colors.green} />;
      case "cancelled":
        return <XCircle size={16} color={Colors.red} />;
      default:
        return <Clock size={16} color={Colors.gray} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return Colors.yellow;
      case "accepted":
      case "preparing":
        return Colors.accent;
      case "ready":
        return Colors.primary;
      case "delivered":
        return Colors.green;
      case "cancelled":
        return Colors.red;
      default:
        return Colors.gray;
    }
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order,
      ),
    );
  };

  const handleOrderAction = (order: Order, action: string) => {
    switch (action) {
      case "accept":
        updateOrderStatus(order.id, "preparing");
        break;
      case "ready":
        updateOrderStatus(order.id, "ready");
        break;
      case "deliver":
        updateOrderStatus(order.id, "delivered");
        break;
      case "cancel":
        Alert.alert(
          "Cancel Order",
          "Are you sure you want to cancel this order?",
          [
            { text: "No", style: "cancel" },
            {
              text: "Yes, Cancel",
              style: "destructive",
              onPress: () => updateOrderStatus(order.id, "cancelled"),
            },
          ],
        );
        break;
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: "Accept Order",
          action: "accept",
          color: Colors.primary,
        };
      case "preparing":
        return { label: "Mark Ready", action: "ready", color: Colors.primary };
      case "ready":
        return {
          label: "Mark Delivered",
          action: "deliver",
          color: Colors.green,
        };
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Orders Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Manage incoming orders and track status
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {statusOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.filterButton,
              statusFilter === option.key && styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(option.key)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === option.key && styles.filterTextActive,
              ]}
            >
              {option.label}
            </Text>
            {statusFilter === option.key && (
              <View
                style={[
                  styles.filterIndicator,
                  { backgroundColor: option.color },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock size={24} color={Colors.yellow} />
            </View>
            <Text style={styles.statNumber}>
              {orders.filter((o) => o.status === "pending").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Clock3 size={24} color={Colors.accent} />
            </View>
            <Text style={styles.statNumber}>
              {orders.filter((o) => o.status === "preparing").length}
            </Text>
            <Text style={styles.statLabel}>Preparing</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <CheckCircle size={24} color={Colors.green} />
            </View>
            <Text style={styles.statNumber}>
              {orders.filter((o) => o.status === "delivered").length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>
            {statusFilter === "all"
              ? "All Orders"
              : `${statusOptions.find((s) => s.key === statusFilter)?.label} Orders`}
          </Text>

          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Package size={48} color={Colors.gray} />
              <Text style={styles.emptyStateTitle}>No orders found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {statusFilter === "all"
                  ? "You don't have any orders yet"
                  : `No ${statusFilter} orders at the moment`}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => {
                  setSelectedOrder(order);
                  setShowOrderModal(true);
                }}
              >
                <View style={styles.orderHeader}>
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderTime}>{order.orderTime}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(order.status) + "20" },
                    ]}
                  >
                    {getStatusIcon(order.status)}
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(order.status) },
                      ]}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.customerInfo}>
                    <User size={16} color={Colors.gray} />
                    <Text style={styles.customerName}>
                      {order.customerName}
                    </Text>
                  </View>
                  <View style={styles.deliveryInfo}>
                    <MapPin size={16} color={Colors.gray} />
                    <Text style={styles.deliveryAddress} numberOfLines={1}>
                      {order.deliveryAddress}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderItems}>
                  <Text style={styles.itemsText}>
                    {order.items.length} items • ${order.total.toFixed(2)}
                  </Text>
                  <ChevronRight size={16} color={Colors.gray} />
                </View>

                <View style={styles.orderActions}>
                  {order.status === "pending" && (
                    <View style={styles.pendingActions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => handleOrderAction(order, "accept")}
                      >
                        <CheckCircle size={16} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.cancelButton]}
                        onPress={() => handleOrderAction(order, "cancel")}
                      >
                        <XCircle size={16} color={Colors.white} />
                        <Text style={styles.actionButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {order.status === "preparing" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.readyButton]}
                      onPress={() => handleOrderAction(order, "ready")}
                    >
                      <CheckCircle size={16} color={Colors.white} />
                      <Text style={styles.actionButtonText}>Mark Ready</Text>
                    </TouchableOpacity>
                  )}

                  {order.status === "ready" && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deliverButton]}
                      onPress={() => handleOrderAction(order, "deliver")}
                    >
                      <CheckCircle size={16} color={Colors.white} />
                      <Text style={styles.actionButtonText}>
                        Mark Delivered
                      </Text>
                    </TouchableOpacity>
                  )}

                  {order.status === "delivered" && (
                    <View style={styles.completedBadge}>
                      <CheckCircle size={16} color={Colors.green} />
                      <Text style={styles.completedText}>Completed</Text>
                    </View>
                  )}

                  {order.status === "cancelled" && (
                    <View style={styles.cancelledBadge}>
                      <XCircle size={16} color={Colors.red} />
                      <Text style={styles.cancelledText}>Cancelled</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        {selectedOrder && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <Text style={styles.modalSubtitle}>{selectedOrder.id}</Text>
                </View>
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setShowOrderModal(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>
                    Customer Information
                  </Text>
                  <View style={styles.modalInfoRow}>
                    <User size={16} color={Colors.gray} />
                    <Text style={styles.modalInfoText}>
                      {selectedOrder.customerName}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Phone size={16} color={Colors.gray} />
                    <Text style={styles.modalInfoText}>
                      {selectedOrder.customerPhone}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <MapPin size={16} color={Colors.gray} />
                    <Text style={styles.modalInfoText}>
                      {selectedOrder.deliveryAddress}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Items</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.modalItemRow}>
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.notes && (
                          <Text style={styles.itemNotes}>{item.notes}</Text>
                        )}
                      </View>
                      <View style={styles.itemPricing}>
                        <Text style={styles.itemQuantity}>
                          x{item.quantity}
                        </Text>
                        <Text style={styles.itemPrice}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Order Summary</Text>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>
                      ${selectedOrder.total.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>$2.99</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>
                      ${(selectedOrder.total + 2.99).toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Payment Method</Text>
                    <Text style={styles.summaryValue}>
                      {selectedOrder.paymentMethod}
                    </Text>
                  </View>
                </View>

                {selectedOrder.specialInstructions && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>
                      Special Instructions
                    </Text>
                    <Text style={styles.instructionsText}>
                      {selectedOrder.specialInstructions}
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                {selectedOrder.status === "pending" && (
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={[
                        styles.modalActionButton,
                        styles.modalAcceptButton,
                      ]}
                      onPress={() => {
                        handleOrderAction(selectedOrder, "accept");
                        setShowOrderModal(false);
                      }}
                    >
                      <CheckCircle size={16} color={Colors.white} />
                      <Text style={styles.modalActionText}>Accept Order</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalActionButton,
                        styles.modalCancelButton,
                      ]}
                      onPress={() => {
                        handleOrderAction(selectedOrder, "cancel");
                        setShowOrderModal(false);
                      }}
                    >
                      <XCircle size={16} color={Colors.white} />
                      <Text style={styles.modalActionText}>Cancel Order</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {selectedOrder.status === "preparing" && (
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      styles.modalReadyButton,
                      { flex: 1 },
                    ]}
                    onPress={() => {
                      handleOrderAction(selectedOrder, "ready");
                      setShowOrderModal(false);
                    }}
                  >
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.modalActionText}>Mark as Ready</Text>
                  </TouchableOpacity>
                )}

                {selectedOrder.status === "ready" && (
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      styles.modalDeliverButton,
                      { flex: 1 },
                    ]}
                    onPress={() => {
                      handleOrderAction(selectedOrder, "deliver");
                      setShowOrderModal(false);
                    }}
                  >
                    <CheckCircle size={16} color={Colors.white} />
                    <Text style={styles.modalActionText}>
                      Mark as Delivered
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.background,
    position: "relative",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary + "10",
  },
  filterText: {
    fontSize: 14,
    color: Colors.gray,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  filterIndicator: {
    position: "absolute",
    bottom: -2,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  ordersSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginRight: 12,
  },
  orderTime: {
    fontSize: 14,
    color: Colors.gray,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },
  orderDetails: {
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 16,
    color: Colors.dark,
    marginLeft: 8,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveryAddress: {
    fontSize: 14,
    color: Colors.gray,
    marginLeft: 8,
    flex: 1,
  },
  orderItems: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginBottom: 12,
  },
  itemsText: {
    fontSize: 14,
    color: Colors.gray,
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "center",
  },
  pendingActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: "center",
  },
  cancelButton: {
    backgroundColor: Colors.red,
    flex: 1,
    justifyContent: "center",
  },
  readyButton: {
    backgroundColor: Colors.primary,
    flex: 1,
    justifyContent: "center",
  },
  deliverButton: {
    backgroundColor: Colors.green,
    flex: 1,
    justifyContent: "center",
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.green + "10",
    borderRadius: 8,
    gap: 6,
  },
  completedText: {
    color: Colors.green,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelledBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.red + "10",
    borderRadius: 8,
    gap: 6,
  },
  cancelledText: {
    color: Colors.red,
    fontSize: 14,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  modalClose: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: Colors.gray,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 12,
  },
  modalInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modalInfoText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 12,
  },
  modalItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "500",
  },
  itemNotes: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  itemPricing: {
    alignItems: "flex-end",
  },
  itemQuantity: {
    fontSize: 12,
    color: Colors.gray,
  },
  itemPrice: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.dark,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.primary,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.dark,
    lineHeight: 20,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  modalAcceptButton: {
    backgroundColor: Colors.primary,
  },
  modalCancelButton: {
    backgroundColor: Colors.red,
  },
  modalReadyButton: {
    backgroundColor: Colors.primary,
  },
  modalDeliverButton: {
    backgroundColor: Colors.green,
  },
  modalActionText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
