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
  ArrowLeft,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Star,
  Calendar,
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  growth: number;
}

interface ProductPerformance {
  name: string;
  orders: number;
  revenue: number;
  rating: number;
}

const mockSalesData: SalesData[] = [
  {
    period: "Today",
    revenue: 45000,
    orders: 15,
    avgOrderValue: 3000,
    growth: 12,
  },
  {
    period: "This Week",
    revenue: 285000,
    orders: 89,
    avgOrderValue: 3200,
    growth: 8,
  },
  {
    period: "This Month",
    revenue: 1250000,
    orders: 342,
    avgOrderValue: 3650,
    growth: 15,
  },
  {
    period: "This Year",
    revenue: 15800000,
    orders: 4218,
    avgOrderValue: 3745,
    growth: 22,
  },
];

const mockProductPerformance: ProductPerformance[] = [
  { name: "Jollof Rice", orders: 156, revenue: 234000, rating: 4.8 },
  { name: "Fried Rice", orders: 89, revenue: 106800, rating: 4.6 },
  { name: "Grilled Chicken", orders: 234, revenue: 468000, rating: 4.9 },
  { name: "Fish", orders: 67, revenue: 120600, rating: 4.7 },
  { name: "Plantain", orders: 123, revenue: 61500, rating: 4.5 },
];

const mockOrderTrends = [
  { day: "Mon", orders: 12, revenue: 36000 },
  { day: "Tue", orders: 18, revenue: 54000 },
  { day: "Wed", orders: 15, revenue: 45000 },
  { day: "Thu", orders: 22, revenue: 66000 },
  { day: "Fri", orders: 28, revenue: 84000 },
  { day: "Sat", orders: 32, revenue: 96000 },
  { day: "Sun", orders: 25, revenue: 75000 },
];

export default function VendorAnalytics() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState("This Week");
  const [showRevenue, setShowRevenue] = useState(true);

  const currentData =
    mockSalesData.find((data) => data.period === selectedPeriod) ||
    mockSalesData[1];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    trend,
    isCurrency = false,
    isHidden = false,
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: number;
    isCurrency?: boolean;
    isHidden?: boolean;
  }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={styles.statIcon}>
          <Icon size={20} color={Colors.primary} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={styles.statValueContainer}>
        {isHidden ? (
          <Text style={styles.hiddenValue}>••••••</Text>
        ) : (
          <Text style={styles.statValue}>
            {isCurrency && typeof value === "number"
              ? formatCurrency(value)
              : value}
          </Text>
        )}
        {trend !== undefined && (
          <View
            style={[
              styles.trendBadge,
              trend >= 0 ? styles.trendPositive : styles.trendNegative,
            ]}
          >
            <TrendingUp
              size={12}
              color={trend >= 0 ? Colors.green : Colors.red}
            />
            <Text
              style={[
                styles.trendText,
                { color: trend >= 0 ? Colors.green : Colors.red },
              ]}
            >
              {trend >= 0 ? "+" : ""}
              {trend}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const ProductItem = ({
    product,
    index,
  }: {
    product: ProductPerformance;
    index: number;
  }) => (
    <View style={styles.productItem}>
      <View style={styles.productRank}>
        <Text style={styles.rankText}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <View style={styles.productStats}>
          <View style={styles.statRow}>
            <ShoppingCart size={14} color={Colors.gray} />
            <Text style={styles.productStat}>{product.orders} orders</Text>
          </View>
          <View style={styles.statRow}>
            <DollarSign size={14} color={Colors.gray} />
            <Text style={styles.productStat}>
              {formatCurrency(product.revenue)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Star size={14} color={Colors.yellow} />
            <Text style={styles.productStat}>{product.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.productRevenue}>
        <Text style={styles.revenueText}>
          {formatCurrency(product.revenue)}
        </Text>
      </View>
    </View>
  );

  const OrderTrendBar = ({
    day,
    orders,
    maxOrders,
  }: {
    day: string;
    orders: number;
    maxOrders: number;
  }) => {
    const height = (orders / maxOrders) * 100;
    return (
      <View style={styles.trendBarContainer}>
        <View style={[styles.trendBar, { height: `${height}%` }]} />
        <Text style={styles.trendDay}>{day}</Text>
        <Text style={styles.trendOrders}>{orders}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity
          onPress={() => setShowRevenue(!showRevenue)}
          style={styles.visibilityButton}
        >
          {showRevenue ? (
            <Eye size={20} color={Colors.primary} />
          ) : (
            <EyeOff size={20} color={Colors.gray} />
          )}
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.periodSelector}
        contentContainerStyle={styles.periodSelectorContent}
      >
        {mockSalesData.map((period) => (
          <TouchableOpacity
            key={period.period}
            style={[
              styles.periodButton,
              selectedPeriod === period.period && styles.periodButtonActive,
            ]}
            onPress={() => setSelectedPeriod(period.period)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.period &&
                  styles.periodButtonTextActive,
              ]}
            >
              {period.period}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Key Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            <StatCard
              title="Revenue"
              value={currentData.revenue}
              icon={DollarSign}
              trend={currentData.growth}
              isCurrency
              isHidden={!showRevenue}
            />
            <StatCard
              title="Orders"
              value={currentData.orders}
              icon={ShoppingCart}
              trend={currentData.growth}
            />
            <StatCard
              title="Avg Order Value"
              value={currentData.avgOrderValue}
              icon={TrendingUp}
              isCurrency
              isHidden={!showRevenue}
            />
            <StatCard
              title="Customer Rating"
              value="4.8"
              icon={Star}
              trend={0.2}
            />
          </View>
        </View>

        {/* Order Trends */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Trends</Text>
          <View style={styles.trendsContainer}>
            <View style={styles.trendsHeader}>
              <Text style={styles.trendsSubtitle}>This Week</Text>
              <Text style={styles.trendsTotal}>
                {mockOrderTrends.reduce((sum, day) => sum + day.orders, 0)}{" "}
                orders
              </Text>
            </View>
            <View style={styles.trendsChart}>
              {mockOrderTrends.map((day) => (
                <OrderTrendBar
                  key={day.day}
                  day={day.day}
                  orders={day.orders}
                  maxOrders={Math.max(...mockOrderTrends.map((d) => d.orders))}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Top Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Products</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsList}>
            {mockProductPerformance.map((product, index) => (
              <ProductItem key={product.name} product={product} index={index} />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Export Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <TrendingUp size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Compare Periods</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <DollarSign size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Set Goals</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Star size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Customer Insights</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "space-between",
    alignItems: "center",
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
  visibilityButton: {
    padding: 8,
  },
  periodSelector: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  periodSelectorContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: "500",
  },
  periodButtonTextActive: {
    color: Colors.white,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statIcon: {
    marginRight: 8,
  },
  statTitle: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: "500",
  },
  statValueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.dark,
  },
  hiddenValue: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.gray,
    letterSpacing: 4,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  trendPositive: {
    backgroundColor: Colors.greenLight,
  },
  trendNegative: {
    backgroundColor: Colors.redLight,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  trendsContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  trendsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  trendsSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  trendsTotal: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  trendsChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  trendBarContainer: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  trendBar: {
    width: 24,
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  trendDay: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: "500",
  },
  trendOrders: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: "600",
  },
  productsList: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 4,
  },
  productStats: {
    flexDirection: "row",
    gap: 16,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productStat: {
    fontSize: 12,
    color: Colors.gray,
  },
  productRevenue: {
    alignItems: "flex-end",
  },
  revenueText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.dark,
  },
});
