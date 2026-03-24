import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import {
  Bell,
  Truck,
  MapPin,
  ChevronRight,
  Navigation,
  X,
  MessageCircle,
} from "lucide-react-native";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/color";
import { mockRideRequests } from "@/constants/mockData";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import {
  riderApiService,
  formatWhatsAppOrderMessage,
  WhatsAppOrder,
  WhatsAppResponse,
} from "@/services/riderApi";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.3;

// Utility function for reverse geocoding
const getLocationName = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (address) {
      // Build a readable address from available components
      const parts = [];
      if (address.name && address.name !== address.street)
        parts.push(address.name);
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.district) parts.push(address.district);
      if (address.region) parts.push(address.region);

      return parts.length > 0
        ? parts.join(", ")
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

interface SwipeableCardProps {
  request: any;
  index: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClose: (id: string) => void;
  currentLocation?: Location.LocationObject | null;
}

const SwipeableCard = ({
  request,
  index,
  onAccept,
  onReject,
  onClose,
  currentLocation,
}: SwipeableCardProps) => {
  const translateX = useSharedValue(0);

  const [pickupLocationName, setPickupLocationName] = useState(
    request.pickupLocation,
  );
  const [dropoffLocationName, setDropoffLocationName] = useState(
    request.dropoffLocation,
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Resolve location names from coordinates if available
  useEffect(() => {
    const resolveLocationNames = async () => {
      // Check if locations are coordinates (lat, lng format)
      const pickupCoords = request.pickupLocation.match(
        /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/,
      );
      const dropoffCoords = request.dropoffLocation.match(
        /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/,
      );

      if (pickupCoords || dropoffCoords) {
        setIsLoadingLocation(true);

        try {
          if (pickupCoords) {
            const lat = parseFloat(pickupCoords[1]);
            const lng = parseFloat(pickupCoords[2]);
            const name = await getLocationName(lat, lng);
            setPickupLocationName(name);
          }

          if (dropoffCoords) {
            const lat = parseFloat(dropoffCoords[1]);
            const lng = parseFloat(dropoffCoords[2]);
            const name = await getLocationName(lat, lng);
            setDropoffLocationName(name);
          }
        } catch (error) {
          console.error("Error resolving location names:", error);
        } finally {
          setIsLoadingLocation(false);
        }
      }
    };

    resolveLocationNames();
  }, [request.pickupLocation, request.dropoffLocation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  }, [translateX]);

  const bgStyle = useAnimatedStyle(() => {
    const val = translateX.value;
    const opacityReject = interpolate(
      val,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP,
    );
    const opacityAccept = interpolate(
      val,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return {
      backgroundColor:
        val > 0
          ? `rgba(4, 120, 87, ${opacityAccept})` // Green for accept (Swipe Right)
          : `rgba(220, 38, 38, ${opacityReject})`, // Red for reject (Swipe Left)
    };
  }, [translateX]);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    translateX.value = event.nativeEvent.translationX;
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) {
      // State.END
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe Right -> Accept
        translateX.value = withSpring(width, { damping: 20, stiffness: 200 });
        runOnJS(onAccept)(request.id);
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe Left -> Reject
        translateX.value = withSpring(-width, { damping: 20, stiffness: 200 });
        runOnJS(onReject)(request.id);
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    }
  };

  return (
    <View style={styles.cardWrapper}>
      <Animated.View style={[styles.cardBackground, bgStyle]}>
        <View style={styles.bgIcons}>
          <Text style={styles.bgText}>Reject</Text>
          <Text style={styles.bgText}>Accept</Text>
        </View>
      </Animated.View>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.requestCard,
            index === 0 && styles.firstCard,
            animatedStyle,
          ]}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => onClose(request.id)}
          >
            <X
              size={18}
              color={index === 0 ? Colors.white : Colors.textMuted}
            />
          </TouchableOpacity>

          {/* Card Header */}
          <View style={styles.cardTop}>
            <View style={styles.cardHeaderLeft}>
              <View
                style={[
                  styles.iconContainer,
                  index === 0 && styles.iconContainerFirst,
                ]}
              >
                <Truck
                  size={20}
                  color={index === 0 ? Colors.white : Colors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.requestId, index === 0 && styles.whiteText]}
                >
                  {request.passengerName}
                </Text>
                <Text
                  style={[styles.fareText, index === 0 && styles.lightText]}
                >
                  Fare -{" "}
                  <Text style={styles.boldText}>
                    ₦{request.fare.toLocaleString()}
                  </Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.trackingButton,
                index === 0 && styles.trackingButtonFirst,
              ]}
            >
              <Text
                style={[styles.trackingText, index === 0 && styles.whiteText]}
              >
                Tracking
              </Text>
            </TouchableOpacity>
          </View>

          {/* Locations */}
          <View style={styles.locationContainer}>
            <View style={styles.locationInfo}>
              <Text
                numberOfLines={2}
                style={[styles.locationLabel, index === 0 && styles.whiteText]}
              >
                Pickup
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.locationName, index === 0 && styles.whiteText]}
              >
                {pickupLocationName}
              </Text>
            </View>

            <View
              style={[
                styles.distanceBadge,
                index === 0 && styles.distanceBadgeFirst,
              ]}
            >
              <Text
                style={[styles.distanceText, index === 0 && styles.whiteText]}
              >
                {liveDistance}km
              </Text>
            </View>

            <View style={styles.locationInfo}>
              <Text
                numberOfLines={2}
                style={[
                  styles.locationLabel,
                  index === 0 && styles.whiteText,
                  { textAlign: "right" },
                ]}
              >
                Dropoff
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.locationName,
                  index === 0 && styles.whiteText,
                  { textAlign: "right" },
                ]}
              >
                {dropoffLocationName}
              </Text>
            </View>
          </View>

          {/* Actions - Keep buttons but they now just trigger the swipe animation or direct logic */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={[
                styles.rejectButton,
                index === 0 && styles.rejectButtonFirst,
              ]}
              onPress={() => onReject(request.id)}
            >
              <Text
                style={[styles.rejectText, index === 0 && styles.whiteText]}
              >
                Reject
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.acceptButton,
                index === 0 && styles.acceptButtonFirst,
              ]}
              onPress={() => onAccept(request.id)}
            >
              <Text
                style={[styles.acceptText, index === 0 && styles.primaryText]}
              >
                Accept Trip
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

export default function RideRequestsScreen() {
  const router = useRouter();
  const [requests, setRequests] = useState(mockRideRequests);
  const [isGPSEnabled, setIsGPSEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [pendingWhatsAppOrders, setPendingWhatsAppOrders] = useState<
    Map<string, WhatsAppResponse>
  >(new Map());
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const handleAccept = async (requestId: string) => {
    console.log("Accepted request:", requestId);

    // For food delivery requests, send WhatsApp notification to restaurant
    const request = requests.find((r) => r.id === requestId);
    if (request && request.type === "food_delivery") {
      try {
        // Create WhatsApp order notification
        const whatsappOrder: WhatsAppOrder = {
          orderId: requestId,
          restaurantPhone: "+234XXXXXXXXXX", // This should come from restaurant profile
          customerName: request.passengerName,
          customerPhone: request.passengerPhone,
          items: [
            {
              name: "Food Delivery Order",
              quantity: 1,
              price: request.fare,
              specialInstructions: request.specialInstructions || "",
            },
          ],
          totalAmount: request.fare,
          deliveryAddress: request.dropoffLocation,
          pickupLocation: request.pickupLocation,
          timestamp: new Date().toISOString(),
        };

        // Send order to restaurant via WhatsApp
        const response =
          await riderApiService.sendOrderToRestaurant(whatsappOrder);

        Alert.alert(
          "Restaurant Notified!",
          "Order has been sent to the restaurant via WhatsApp.",
          [{ text: "OK" }],
        );

        // Start checking for restaurant response
        setTimeout(() => checkRestaurantResponse(requestId), 5000);
      } catch (error) {
        console.error("Failed to notify restaurant via WhatsApp:", error);
        Alert.alert(
          "Notification Failed",
          "Failed to notify restaurant via WhatsApp, but you can still proceed with the delivery.",
          [{ text: "OK" }],
        );
      }
    }

    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    // Navigate to active trip page
    router.push("/active-trip");
  };

  const handleReject = (requestId: string) => {
    console.log("Rejected request:", requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
    if (requests.length === 1) {
      Alert.alert(
        "All Requests Handled",
        "You have cleared all pending ride requests.",
      );
    }
  };

  const handleClose = (requestId: string) => {
    console.log("Closed card:", requestId);
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const checkRestaurantResponse = async (orderId: string) => {
    try {
      const response = await riderApiService.checkRestaurantResponse(orderId);

      if (response && response.restaurantResponse) {
        if (response.restaurantResponse === "1") {
          Alert.alert(
            "Order Accepted! 🎉",
            "The restaurant has accepted your order.",
            [{ text: "OK" }],
          );
        } else if (response.restaurantResponse === "2") {
          Alert.alert(
            "Order Declined",
            "The restaurant has declined your order. Please contact support.",
            [{ text: "OK" }],
          );
        }
      } else {
        // Check again in 5 seconds if no response yet
        setTimeout(() => checkRestaurantResponse(orderId), 5000);
      }
    } catch (error) {
      console.error("Error checking restaurant response:", error);
      // Check again in 5 seconds on error
      setTimeout(() => checkRestaurantResponse(orderId), 5000);
    }
  };

  // GPS Location tracking
  useEffect(() => {
    let locationWatcher: Location.LocationSubscription | null = null;

    const startLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.warn("Permission to access location was denied");
          return;
        }

        // Get initial location
        const currentLocation = await Location.getCurrentPositionAsync({});
        setCurrentLocation(currentLocation);
        setIsGPSEnabled(true);

        // Watch for location changes
        locationWatcher = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 50, // Update every 50 meters
            timeInterval: 10000, // Update every 10 seconds
          },
          (newLocation) => {
            setCurrentLocation(newLocation);
          },
        );
      } catch (error) {
        console.error("Error starting location tracking:", error);
        setIsGPSEnabled(false);
      }
    };

    startLocationTracking();

    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>New Trip Requests</Text>
              <View
                style={[
                  styles.gpsIndicator,
                  isGPSEnabled && styles.gpsIndicatorActive,
                ]}
              >
                <Navigation
                  size={12}
                  color={isGPSEnabled ? Colors.white : Colors.textMuted}
                />
              </View>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {requests.map((request, index) => (
            <SwipeableCard
              key={request.id}
              request={request}
              index={index}
              onAccept={handleAccept}
              onReject={handleReject}
              onClose={handleClose}
            />
          ))}

          {requests.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No new requests at the moment
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}

// Utility function for reverse geocoding
const getLocationName = async (
  latitude: number,
  longitude: number,
): Promise<string> => {
  try {
    const [address] = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (address) {
      // Build a readable address from available components
      const parts = [];
      if (address.name && address.name !== address.street)
        parts.push(address.name);
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.district) parts.push(address.district);
      if (address.region) parts.push(address.region);

      return parts.length > 0
        ? parts.join(", ")
        : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
};

// Utility function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  badgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.warning,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  gpsIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.textMuted,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.6,
  },
  gpsIndicatorActive: {
    backgroundColor: Colors.success,
    opacity: 1,
  },
  seeAllText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  handleReject: {
    backgroundColor: Colors.error,
  },
  handleAccept: {
    backgroundColor: Colors.success,
  },
  cardWrapper: {
    marginBottom: 12,
    position: "relative",
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    justifyContent: "center",
  },
  bgIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
  },
  bgText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  requestCard: {
    backgroundColor: "#2C2C2E", // Dark card for regular requests
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  firstCard: {
    backgroundColor: Colors.primary, // Green for the primary/first request
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconContainerFirst: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  requestId: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 2,
  },
  fareText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: "600",
  },
  seatsText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  lightText: {
    color: "rgba(0,0,0,0.6)",
  },
  boldText: {
    fontWeight: "700",
    color: Colors.white,
  },
  whatsappStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  whatsappText: {
    fontSize: 10,
    color: "#25D366",
    marginLeft: 4,
    fontWeight: "500",
  },
  whiteText: {
    color: Colors.white,
  },
  trackingButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  trackingButtonFirst: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  trackingText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  locationInfo: {
    flex: 1,
    paddingHorizontal: 5,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  locationName: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.white,
    lineHeight: 18,
  },
  distanceBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 10,
  },
  distanceBadgeFirst: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  distanceText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.white,
  },
  liveDistanceText: {
    fontSize: 9,
    fontWeight: "600",
    color: Colors.success,
    marginTop: 2,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButtonFirst: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  rejectText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.white,
  },
  acceptButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonFirst: {
    backgroundColor: Colors.black,
  },
  acceptText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.white,
  },
  primaryText: {
    color: Colors.white,
  },
});
