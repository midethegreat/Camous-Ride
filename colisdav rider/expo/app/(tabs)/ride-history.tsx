import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, CreditCard, Star, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useAuth } from "@/contexts/AuthContext";
import { riderApiService } from "@/services/riderApi";
import { tripHistory as mockTripHistory } from "@/constants/driver-data";

interface Trip {
  id: string;
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  fare: number;
  status: "completed" | "cancelled" | "pending";
  date: string;
  time: string;
  rating?: number;
}

export default function RideHistoryScreen() {
  const { user } = useAuth();
  const [tripHistory, setTripHistory] = useState<Trip[]>(mockTripHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const driverId = user?.id || "1";

  useEffect(() => {
    if (user) {
      fetchTripHistory();
    }
  }, [user]);

  const fetchTripHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trip history from API
      const trips = await riderApiService.getDriverTrips(driverId);
      setTripHistory(trips);
    } catch (err) {
      console.error("Error fetching trip history:", err);
      setError("Failed to load trip history. Using mock data.");
      setTripHistory(mockTripHistory);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { backgroundColor: Colors.successLight, color: Colors.success };
      case "cancelled":
        return { backgroundColor: Colors.errorLight, color: Colors.error };
      default:
        return {
          backgroundColor: Colors.borderLight,
          color: Colors.textSecondary,
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading history data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTripHistory}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity style={[styles.filterTab, styles.filterTabActive]}>
            <Text style={[styles.filterText, styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Completed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterTab}>
            <Text style={styles.filterText}>Cancelled</Text>
          </TouchableOpacity>
        </View>

        {/* Trip List */}
        <View style={styles.tripList}>
          {tripHistory.map((trip) => {
            const statusStyle = getStatusStyle(trip.status);
            return (
              <View key={trip.id} style={styles.tripCard}>
                {/* Trip Header */}
                <View style={styles.tripHeader}>
                  <View style={styles.tripDateContainer}>
                    <Calendar size={14} color={Colors.textMuted} />
                    <Text style={styles.tripDate}>
                      {formatDate(trip.date)} • {formatTime(trip.date)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: statusStyle.color }]}
                    >
                      {trip.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Trip Route */}
                <View style={styles.routeContainer}>
                  <View style={styles.routePoints}>
                    <View style={styles.pickupDot} />
                    <View style={styles.routeLine} />
                    <View style={styles.dropoffDot} />
                  </View>
                  <View style={styles.routeInfo}>
                    <View style={styles.locationItem}>
                      <Text style={styles.locationLabel}>PICKUP</Text>
                      <Text style={styles.locationText}>{trip.pickup}</Text>
                    </View>
                    <View style={styles.locationItem}>
                      <Text style={styles.locationLabel}>DESTINATION</Text>
                      <Text style={styles.locationText}>{trip.dropoff}</Text>
                    </View>
                  </View>
                </View>

                {/* Trip Footer */}
                <View style={styles.tripFooter}>
                  <View style={styles.tripMeta}>
                    <View style={styles.metaItem}>
                      <CreditCard size={14} color={Colors.textMuted} />
                      <Text style={styles.metaText}>₦{trip.fare}</Text>
                    </View>
                    {trip.rating && (
                      <View style={styles.metaItem}>
                        <Star
                          size={14}
                          color={Colors.warning}
                          fill={Colors.warning}
                        />
                        <Text style={styles.metaText}>{trip.rating}.0</Text>
                      </View>
                    )}
                  </View>
                  {trip.status === "completed" && (
                    <TouchableOpacity style={styles.receiptButton}>
                      <Text style={styles.receiptText}>RECEIPT</Text>
                      <ChevronRight size={14} color={Colors.primary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingTop: 26,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 1,
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: Colors.white,
  },
  tripList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tripCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  tripDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  tripDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  routeContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  routePoints: {
    width: 20,
    alignItems: "center",
    marginRight: 12,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  dropoffDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.error,
  },
  routeInfo: {
    flex: 1,
    justifyContent: "space-between",
    height: 50,
  },
  locationItem: {
    gap: 2,
  },
  locationLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  tripFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  tripMeta: {
    flexDirection: "row",
    gap: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  receiptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  receiptText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  bottomPadding: {
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
