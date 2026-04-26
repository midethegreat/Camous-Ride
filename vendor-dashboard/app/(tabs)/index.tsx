import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
  Bell,
  Menu,
  X,
  Brain,
  Zap,
  Target,
} from "lucide-react-native";
import { Colors } from "../../constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useRecommendations,
  useDemandPrediction,
  useAnomalyDetection,
} from "../../hooks/useAI";

export default function VendorDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // AI Features for Vendor Dashboard
  const {
    recommendations,
    loading: recommendationsLoading,
    generateRecommendations,
  } = useRecommendations(
    { name: "Vendor", preferences: { category: "food", location: "campus" } },
    [],
    { autoProcess: true, cacheKey: "vendor_recommendations" },
  );

  const {
    demandPrediction,
    loading: demandLoading,
    predictDemand,
  } = useDemandPrediction(
    { latitude: 6.5299, longitude: 3.3847 }, // Campus center
    new Date().toLocaleTimeString(),
    { autoProcess: true, cacheKey: "vendor_demand_prediction" },
  );

  const {
    anomalies,
    riskScore,
    loading: anomalyLoading,
    detectAnomalies,
  } = useAnomalyDetection(
    [], // Will be populated with real transaction data
    { autoProcess: true, cacheKey: "vendor_anomalies" },
  );

  const [showAIFeatures, setShowAIFeatures] = useState(false);

  const menuItems = [
    {
      title: "Orders",
      icon: ShoppingCart,
      route: "/orders",
      color: Colors.vendorPrimary,
    },
    {
      title: "Products",
      icon: Package,
      route: "/products",
      color: Colors.vendorSecondary,
    },
    {
      title: "Analytics",
      icon: TrendingUp,
      route: "/analytics",
      color: Colors.vendorAccent,
    },
    {
      title: "Messages",
      icon: MessageCircle,
      route: "/chat",
      color: Colors.vendorPrimary,
    },
  ];

  const stats = [
    { label: "Today's Orders", value: "24", change: "+12%" },
    { label: "Revenue", value: "₦125,000", change: "+8%" },
    { label: "Active Products", value: "156", change: "+5" },
    { label: "Rating", value: "4.8", change: "+0.2" },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      customer: "John Doe",
      items: "2 items",
      amount: "₦2,500",
      status: "preparing",
      time: "5 min ago",
    },
    {
      id: "ORD-002",
      customer: "Jane Smith",
      items: "1 item",
      amount: "₦1,800",
      status: "ready",
      time: "12 min ago",
    },
    {
      id: "ORD-003",
      customer: "Mike Johnson",
      items: "3 items",
      amount: "₦4,200",
      status: "delivered",
      time: "25 min ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "#FF9500";
      case "ready":
        return "#007AFF";
      case "delivered":
        return "#34C759";
      default:
        return "#8E8E93";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setDrawerOpen(!drawerOpen)}
          style={styles.menuButton}
        >
          {drawerOpen ? <X size={24} /> : <Menu size={24} />}
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Store size={24} color={Colors.vendorPrimary} />
          <Text style={styles.headerText}>Vendor Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Bell size={24} color={Colors.text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text
                style={[
                  styles.statChange,
                  {
                    color: stat.change.startsWith("+")
                      ? Colors.success
                      : Colors.error,
                  },
                ]}
              >
                {stat.change}
              </Text>
            </View>
          ))}
        </View>

        {/* AI Features Section */}
        {(demandPrediction ||
          recommendations.length > 0 ||
          anomalies.length > 0) && (
          <View style={styles.aiSection}>
            <View style={styles.aiHeader}>
              <Brain size={20} color={Colors.vendorPrimary} />
              <Text style={styles.aiTitle}>AI Insights</Text>
              <TouchableOpacity
                onPress={() => setShowAIFeatures(!showAIFeatures)}
              >
                <Text style={styles.aiToggle}>
                  {showAIFeatures ? "Hide" : "Show"}
                </Text>
              </TouchableOpacity>
            </View>

            {showAIFeatures && (
              <View style={styles.aiContent}>
                {demandPrediction && (
                  <View style={styles.aiItem}>
                    <TrendingUp size={16} color={Colors.vendorPrimary} />
                    <View style={styles.aiItemText}>
                      <Text style={styles.aiItemLabel}>Demand Forecast</Text>
                      <Text style={styles.aiItemValue}>
                        {Math.round(demandPrediction.demand_level * 100)}%
                        demand • {demandPrediction.recommended_drivers} drivers
                        needed
                      </Text>
                    </View>
                  </View>
                )}

                {recommendations.length > 0 && (
                  <View style={styles.aiItem}>
                    <Target size={16} color={Colors.vendorSecondary} />
                    <View style={styles.aiItemText}>
                      <Text style={styles.aiItemLabel}>
                        Smart Recommendations
                      </Text>
                      <Text style={styles.aiItemValue}>
                        {recommendations[0].name} • {recommendations[0].reason}
                      </Text>
                    </View>
                  </View>
                )}

                {anomalies.length > 0 && (
                  <View style={styles.aiItem}>
                    <Zap size={16} color={Colors.vendorAccent} />
                    <View style={styles.aiItemText}>
                      <Text style={styles.aiItemLabel}>Anomaly Detection</Text>
                      <Text style={styles.aiItemValue}>
                        {anomalies.length} unusual patterns detected • Risk:{" "}
                        {Math.round(riskScore * 100)}%
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionButton, { borderColor: item.color }]}
                onPress={() => router.push(item.route)}
              >
                <item.icon size={32} color={item.color} />
                <Text style={styles.actionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.ordersContainer}>
          <View style={styles.ordersHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push("/orders")}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {recentOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>{order.id}</Text>
                <Text style={styles.orderCustomer}>{order.customer}</Text>
                <Text style={styles.orderDetails}>
                  {order.items} • {order.time}
                </Text>
              </View>
              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>{order.amount}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
  },
  menuButton: {
    padding: 8,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: Colors.vendorPrimary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  statChange: {
    fontSize: 12,
    fontWeight: "500",
  },

  // AI Features Styles
  aiSection: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginLeft: 8,
    flex: 1,
  },
  aiToggle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.vendorPrimary,
  },
  aiContent: {
    gap: 12,
  },
  aiItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aiItemText: {
    marginLeft: 12,
    flex: 1,
  },
  aiItemLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  aiItemValue: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },

  actionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: "48%",
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginTop: 8,
  },
  ordersContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  ordersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.vendorPrimary,
    fontWeight: "500",
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  orderCustomer: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginVertical: 2,
  },
  orderDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  orderRight: {
    alignItems: "flex-end",
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
