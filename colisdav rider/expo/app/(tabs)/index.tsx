import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Dimensions,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import * as Location from "expo-location";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  Power,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Navigation,
  User,
  CheckCircle2,
  X,
  Phone,
  MessageCircle,
  Bell,
  ArrowRight,
  Menu,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useAuth } from "@/contexts/AuthContext";
import {
  driverProfile as mockDriverProfile,
  todayStats as mockTodayStats,
  rideRequests as mockRideRequests,
  walletData as mockWalletData,
  vehicleInfo as mockVehicleInfo,
} from "@/constants/driver-data";
import {
  riderApiService,
  DriverProfile,
  DriverStats,
  RideRequest,
} from "@/services/riderApi";
import {
  rideBookingService,
  BookingNotification,
} from "@/services/rideBookingService";
import SideMenu from "@/components/SideMenu";
import RideRequestModal from "@/components/RideRequestModal";

const { width } = Dimensions.get("window");

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f0f0f0" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#444444" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#94d3f3" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#ffeb3b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#c5e1a5" }],
  },
];

export default function DriverHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const isKYCVerified = user?.kycStatus === "verified";
  const isKYCPending = user?.kycStatus === "submitted";
  const [showKycWarning, setShowKycWarning] = useState(!isKYCVerified);

  useEffect(() => {
    setShowKycWarning(!isKYCVerified);
  }, [user?.kycStatus]);
  const [isRideModalVisible, setIsRideModalVisible] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(
    null,
  );
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);
  const [rideRequests, setRideRequests] = useState<BookingNotification[]>([]);
  const [pendingRequest, setPendingRequest] =
    useState<BookingNotification | null>(null);
  const [activeRequest, setActiveRequest] =
    useState<BookingNotification | null>(null);
  const [tripStage, setTripStage] = useState<
    "idle" | "toPickup" | "arrived" | "inProgress"
  >("idle");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const initialRegion = {
    latitude: 6.5244, // Default to Lagos, Nigeria
    longitude: 3.3792,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  };

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Initial map centering
      if (mapRef.current && currentLocation.coords) {
        mapRef.current.animateToRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      }

      // Watch for location changes
      const locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (newLoc) => {
          setLocation(newLoc);
          // Only animate to new location if it moved significantly
          // but avoid forced state-driven region updates to stop shaking
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            });
          }
        },
      );

      return () => locationWatcher.remove();
    })();
  }, []);

  useEffect(() => {
    // Pulse animation for the GO button
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };

    if (!isOnline) {
      startPulse();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isOnline]);

  // Mock driver ID - in real app, this would come from auth context
  const driverId = "1";

  useEffect(() => {
    // fetchDriverData(); // Disabled API fetching as requested
    // fetchRideRequests(); // Disabled API fetching as requested

    // Update state based on user from AuthContext
    if (user) {
      setDriverProfile({
        id: user.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone,
        rating: user.rating,
        trips: user.totalTrips,
        vehicleType: user.vehicle?.type || "Tricycle (Keke)",
        isOnline: false,
        isKYCVerified: user.kycStatus === "verified",
      } as any);
      setShowKycWarning(user.kycStatus !== "verified");
    }

    setDriverStats({
      earningsToday: 1245,
      tripsCompleted: 26,
      onlineHours: 8.5,
    } as any);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (isOnline) {
      // Subscribe to live bookings when online
      const unsubscribe = rideBookingService.subscribe((newBooking) => {
        setRideRequests((prev) => {
          // Add new booking or update existing one
          const existingIndex = prev.findIndex((r) => r.id === newBooking.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newBooking;
            return updated;
          } else {
            return [...prev, newBooking];
          }
        });

        // Show modal for new pending requests
        if (
          newBooking.status === "pending" &&
          !activeRequest &&
          !pendingRequest
        ) {
          setPendingRequest(newBooking);
          setIsRideModalVisible(true);
        }
      });

      // Get any existing bookings
      const existingBookings = rideBookingService.getActiveBookings();
      setRideRequests(existingBookings);

      return () => unsubscribe();
    } else {
      // Clear ride requests when going offline
      setRideRequests([]);
      setPendingRequest(null);
      setIsRideModalVisible(false);
    }
  }, [isOnline, activeRequest, pendingRequest]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch driver profile and stats
      const [profile, stats] = await Promise.all([
        riderApiService.getDriverProfile(driverId),
        riderApiService.getDriverStats(driverId, "today"),
      ]);

      // Ensure profile has required data
      if (profile && profile.name) {
        setDriverProfile(profile);
      } else {
        console.warn("Profile data incomplete, using mock data");
        setDriverProfile(mockDriverProfile as any);
      }

      if (stats) {
        setDriverStats(stats);
      } else {
        setDriverStats(mockTodayStats as any);
      }

      // If online, fetch ride requests
      if (isOnline) {
        await fetchRideRequests();
      }
    } catch (err) {
      console.error("Error fetching driver data:", err);
      setError("Failed to load driver data. Using mock data.");

      // Fallback to mock data on error
      setDriverProfile(mockDriverProfile as any);
      setDriverStats(mockTodayStats as any);
      setRideRequests(mockRideRequests as any);
    } finally {
      setLoading(false);
    }
  };

  const fetchRideRequests = async () => {
    try {
      const requests = await riderApiService.getRideRequests(
        driverId,
        "pending",
      );
      setRideRequests(requests);

      // If there's a pending request and no active request, show the modal
      if (requests.length > 0 && !activeRequest && !pendingRequest) {
        setPendingRequest(requests[0]);
        setIsRideModalVisible(true);
      }
    } catch (err) {
      console.error("Error fetching ride requests:", err);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const toggleOnline = async () => {
    if (!isKYCVerified) {
      alert("Please complete your KYC verification to go online.");
      return;
    }
    try {
      const newStatus = !isOnline;
      setIsOnline(newStatus);

      // Try to update driver status in backend, but don't fail if API is not available
      try {
        await riderApiService.updateDriverStatus(
          driverId,
          newStatus ? "online" : "offline",
        );
      } catch (apiError) {
        console.warn("API call failed, continuing with mock data:", apiError);
        // Continue with local state changes even if API fails
      }

      if (newStatus) {
        // Fetch ride requests immediately when going online
        await fetchRideRequests();
      } else {
        // Clear ride requests when going offline
        setRideRequests([]);
        setPendingRequest(null);
        setIsRideModalVisible(false);
      }
    } catch (err) {
      console.error("Error updating driver status:", err);
      // Revert status on error
      setIsOnline(!isOnline);
    }
  };

  const handleAcceptRide = async () => {
    if (pendingRequest) {
      try {
        // Accept the booking through the service
        const success = rideBookingService.acceptBooking(pendingRequest.id);
        if (success) {
          setActiveRequest(pendingRequest);
          setTripStage("toPickup");
          setIsRideModalVisible(false);
          setPendingRequest(null);

          // Update the ride requests list
          setRideRequests((prev) =>
            prev.filter((r) => r.id !== pendingRequest.id),
          );

          // Navigate to active trip page
          router.push("/active-trip");
        }
      } catch (err) {
        console.error("Error accepting ride:", err);
      }
    }
  };

  const handleDeclineRide = () => {
    if (pendingRequest) {
      rideBookingService.declineBooking(pendingRequest.id);
      setRideRequests((prev) => prev.filter((r) => r.id !== pendingRequest.id));
    }
    setIsRideModalVisible(false);
    setPendingRequest(null);
  };

  const arrivedAtPickup = () => {
    setTripStage("arrived");
  };

  const startTrip = () => {
    setTripStage("inProgress");
  };

  const completeTrip = async () => {
    if (activeRequest) {
      try {
        // In real app, you would call an API to complete the ride
        // For now, just reset the state
        setActiveRequest(null);
        setTripStage("idle");

        // Refresh stats after completing trip
        const stats = await riderApiService.getDriverStats(driverId, "today");
        setDriverStats(stats);
      } catch (err) {
        console.error("Error completing trip:", err);
      }
    }
  };

  const cancelTrip = () => {
    setActiveRequest(null);
    setTripStage("idle");
  };

  // Mock chart data - this would come from API in real app
  const incomeChartData = [
    { hour: "09", value: 300, active: false },
    { hour: "10", value: 450, active: true },
    { hour: "11", value: 600, active: true },
    { hour: "12", value: 400, active: true },
    { hour: "13", value: 500, active: true },
    { hour: "14", value: 700, active: true },
    { hour: "15", value: 450, active: true },
    { hour: "16", value: 350, active: true },
    { hour: "17", value: 250, active: false },
    { hour: "18", value: 650, active: true },
    { hour: "19", value: 800, active: true },
    { hour: "20", value: 550, active: true },
  ];

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading driver data...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDriverData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Use mock data as fallback if real data is not available
  const profile = driverProfile || mockDriverProfile;
  const stats = driverStats || mockTodayStats;
  const currentRequests =
    rideRequests.length > 0 ? rideRequests : mockRideRequests;
  const wallet = mockWalletData; // This would also come from API in real app
  const vehicle = mockVehicleInfo; // This would also come from API in real app

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <SideMenu
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        driverProfile={driverProfile}
      />
      <RideRequestModal
        isVisible={isRideModalVisible}
        onClose={handleDeclineRide}
        request={pendingRequest}
        onAccept={handleAcceptRide}
        onDecline={handleDeclineRide}
      />

      {/* Map Background Placeholder */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={initialRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsCompass={false}
          customMapStyle={mapStyle} // Dark or professional map style
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="You"
            >
              <View style={styles.markerContainer}>
                <View style={styles.markerCore}>
                  <Navigation size={20} color="white" fill="white" />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Floating Header Container (Profile + KYC) */}
        <View style={styles.topHeaderContainer}>
          {/* Profile Card */}
          <View style={styles.floatingCard}>
            <TouchableOpacity
              style={styles.menuTrigger}
              onPress={() => setIsMenuVisible(true)}
            >
              <Menu size={24} color={Colors.text} />
            </TouchableOpacity>

            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop",
              }}
              style={styles.profilePicSmall}
            />

            <View style={styles.cardInfo}>
              <Text style={styles.driverName}>
                {(user?.fullName || "Rider").split(" ")[0]}
              </Text>
              <Text style={styles.driverPhone}>
                {user?.phone || "+234 000 000 0000"}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                { backgroundColor: isOnline ? Colors.success : "#E5E7EB" },
              ]}
            >
              {isOnline && (
                <CheckCircle2
                  size={14}
                  color="white"
                  style={{ marginRight: 4 }}
                />
              )}
              <Text
                style={[
                  styles.statusBadgeText,
                  { color: isOnline ? "white" : Colors.textMuted },
                ]}
              >
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>

          {/* KYC Warning Banner - Now stacks below naturally */}
          {showKycWarning && (
            <View
              style={[
                styles.kycWarningBanner,
                isKYCPending && { backgroundColor: Colors.warning },
              ]}
            >
              <View style={styles.kycWarningContent}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.kycWarningTitle}>
                    {isKYCPending ? "Review in Progress" : "KYC Required"}
                  </Text>
                  <Text style={styles.kycWarningText} numberOfLines={1}>
                    {isKYCPending
                      ? "Admin is currently previewing your docs."
                      : "Complete verification to start."}
                  </Text>
                </View>
                {!isKYCPending && (
                  <TouchableOpacity
                    style={styles.kycVerifyBtn}
                    onPress={() => router.push("/kyc")}
                  >
                    <Text style={styles.kycVerifyBtnText}>Verify</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Online Stats Bar - Only shows when online */}
        {isOnline && (
          <View style={styles.onlineStatsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>85%</Text>
              <Text style={styles.statLabel}>Acceptance</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₦1,245</Text>
              <Text style={styles.statLabel}>Earnings</Text>
            </View>
          </View>
        )}

        {/* GO Button */}
        <View style={styles.goButtonContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[
                styles.goButton,
                { backgroundColor: isOnline ? Colors.error : Colors.success },
              ]}
              onPress={toggleOnline}
            >
              <View style={styles.goButtonInner}>
                <Text style={styles.goButtonText}>
                  {isOnline ? "STOP" : "GO"}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  markerContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  markerCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  topHeaderContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
    gap: 10, // Adds space between header and KYC banner
  },
  floatingCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  menuTrigger: {
    marginRight: 12,
  },
  profilePicSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FCA5A5", // Reddish border like in image
    marginRight: 12, // Added margin
  },
  cardInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  driverPhone: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  kycWarningBanner: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  kycWarningContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  kycWarningTitle: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
  kycWarningText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
  },
  kycVerifyBtn: {
    backgroundColor: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  kycVerifyBtnText: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: "700",
  },
  onlineStatsBar: {
    position: "absolute",
    bottom: 160, // Above the GO button
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F3F4F6",
  },
  goButtonContainer: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  goButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  goButtonInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  goButtonText: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
