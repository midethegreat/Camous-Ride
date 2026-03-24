import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowUpRight,
  Download,
  ChevronRight,
  TrendingUp,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useAuth } from "@/contexts/AuthContext";
import { riderApiService } from "@/services/riderApi";
import {
  mockDriverProfile,
  mockDriverStats,
  mockTrips,
  mockRideRequests,
  mockNotifications,
  mockWalletData,
} from "@/constants/mockData";
const _width = Dimensions.get("window").width;
const chartHeight = 120;

interface WalletData {
  balance: number;
  totalEarned: number;
  pendingPayout?: number;
  transactions?: Array<any>;
}

interface WeeklyEarning {
  day: string;
  amount: number;
}

export default function EarningsScreen() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState<WalletData>(mockWalletData);
  const isKYCVerified = user?.kycStatus === "verified";
  const [weeklyEarnings, setWeeklyEarnings] = useState<WeeklyEarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const driverId = "1";
  const maxAmount =
    weeklyEarnings.length > 0
      ? Math.max(...weeklyEarnings.map((e) => e.amount))
      : 0;

  useEffect(() => {
    // fetchEarningsData(); // Disabled API fetching as requested
    setLoading(false);
    setWalletData(mockWalletData);
    const mockWeeklyData = [
      { day: "4 Mon", amount: 20 },
      { day: "5 Tue", amount: 35 },
      { day: "6 Wed", amount: 60 },
      { day: "7 Thu", amount: 75 },
      { day: "8 Fri", amount: 60 },
      { day: "9 Sat", amount: 32 },
      { day: "10 Sun", amount: 25 },
    ];
    setWeeklyEarnings(mockWeeklyData);
  }, []);

  const fetchEarningsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [wallet, earnings] = await Promise.all([
        riderApiService.getDriverWallet(driverId),
        riderApiService.getDriverEarnings(driverId, "week"),
      ]);

      setWalletData(wallet);
      const weeklyData = earnings.weeklyData || [
        { day: "Mon", amount: 125.5 },
        { day: "Tue", amount: 89.75 },
        { day: "Wed", amount: 156.25 },
        { day: "Thu", amount: 98.9 },
        { day: "Fri", amount: 187.3 },
        { day: "Sat", amount: 234.8 },
        { day: "Sun", amount: 167.45 },
      ];
      setWeeklyEarnings(weeklyData);
    } catch (err) {
      console.error("Error fetching earnings data:", err);
      setWalletData(mockWalletData);
      const mockWeeklyData = [
        { day: "4 Mon", amount: 20 },
        { day: "5 Tue", amount: 35 },
        { day: "6 Wed", amount: 60 },
        { day: "7 Thu", amount: 75 },
        { day: "8 Fri", amount: 60 },
        { day: "9 Sat", amount: 32 },
        { day: "10 Sun", amount: 25 },
      ];
      setWeeklyEarnings(mockWeeklyData);
      setError("Using mock data - API not available");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const handleWithdraw = () => {
    if (!isKYCVerified) {
      alert("Please complete your KYC verification to withdraw your earnings.");
      return;
    }
    // Proceed with withdrawal logic
    alert("Withdrawal request initiated!");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading earnings data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Income Card */}
        <View style={styles.walletSection}>
          <TouchableOpacity
            style={styles.walletCard}
            onPress={handleWithdraw}
            activeOpacity={0.9}
          >
            <View style={styles.walletHeader}>
              <View>
                <Text style={styles.walletLabel}>Total Balance</Text>
                <Text style={styles.walletValue}>
                  {formatCurrency(walletData.balance || 450.5)}
                </Text>
              </View>
              {!isKYCVerified ? (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>Unverified</Text>
                </View>
              ) : (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            <View style={styles.walletFooter}>
              <View>
                <Text style={styles.walletSubLabel}>Total Earned</Text>
                <Text style={styles.walletSubValue}>
                  {formatCurrency(walletData.totalEarned || 634.99)}
                </Text>
              </View>
              <View style={styles.trendContainer}>
                <ArrowUpRight size={16} color={Colors.success} />
                <Text style={styles.trendText}>+0.5%</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: "#E0F2F1" }]}>
              <Download size={20} color="#00796B" />
            </View>
            <Text style={styles.statBoxValue}>380</Text>
            <Text style={styles.statBoxLabel}>Total Orders</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
              <TrendingUp size={20} color="#E65100" />
            </View>
            <Text style={styles.statBoxValue}>89%</Text>
            <Text style={styles.statBoxLabel}>On-time</Text>
          </View>

          <View style={styles.statBox}>
            <View style={[styles.statIcon, { backgroundColor: "#F3E5F5" }]}>
              <TrendingUp size={20} color="#7B1FA2" />
            </View>
            <Text style={styles.statBoxValue}>
              {((user?.subscription?.commissionRate || 0.1) * 100).toFixed(0)}%
            </Text>
            <Text style={styles.statBoxLabel}>Commission</Text>
          </View>
        </View>

        {/* Trend Income Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trend Income</Text>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Week</Text>
              <ChevronRight
                size={16}
                color={Colors.textSecondary}
                style={{ transform: [{ rotate: "90deg" }] }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {weeklyEarnings.map((item, index) => (
                <View key={index} style={styles.chartBarWrapper}>
                  <View style={styles.chartBarContainer}>
                    <View
                      style={[
                        styles.chartBar,
                        {
                          height:
                            (item.amount / (maxAmount || 1)) * chartHeight,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.chartLabel}>
                    {item.day.split(" ")[0]}
                  </Text>
                  <Text style={styles.chartLabelSub}>
                    {item.day.split(" ")[1]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.showMoreText}>Show More</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityList}>
            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <Download size={20} color={Colors.success} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Resto Padang Gahar</Text>
                <Text style={styles.activityTime}>35 min ago</Text>
              </View>
              <View style={styles.activityAmountContainer}>
                <Text style={styles.activityAmount}>{formatCurrency(22)}</Text>
                <Text style={styles.activityStatus}>Received</Text>
              </View>
            </View>

            <View style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <TrendingUp size={20} color={Colors.success} />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Tips</Text>
                <Text style={styles.activityTime}>45 min ago</Text>
              </View>
              <View style={styles.activityAmountContainer}>
                <Text style={styles.activityAmount}>{formatCurrency(5)}</Text>
                <Text style={styles.activityStatus}>Received</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
  },
  walletSection: {
    paddingHorizontal: 15,
    marginTop: 8,
    marginBottom: 15,
  },
  walletCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  walletLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  walletValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
  },
  walletFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  walletSubLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginBottom: 2,
  },
  walletSubValue: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  verifiedBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  verifiedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 15,
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
  },
  statBoxLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  lockedBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  lockedText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "700",
    color: "white",
  },
  trendSubText: {
    color: Colors.textMuted,
    fontWeight: "400",
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  dropdownText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chartContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    paddingBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: chartHeight + 35,
  },
  chartBarWrapper: {
    alignItems: "center",
    width: (_width - 70) / 7,
  },
  chartBarContainer: {
    height: chartHeight,
    width: 12,
    backgroundColor: Colors.borderLight,
    borderRadius: 6,
    justifyContent: "flex-end",
    marginBottom: 6,
  },
  chartBar: {
    width: 12,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  chartLabel: {
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  chartLabelSub: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: "600",
  },
  activityList: {
    gap: 16,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  activityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.successLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  activityAmountContainer: {
    alignItems: "flex-end",
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  activityStatus: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
