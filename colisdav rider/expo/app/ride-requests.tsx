import React, { useState } from "react";
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
  ArrowLeft,
  Bell,
  Truck,
  MapPin,
  ChevronRight,
  Navigation,
  X,
} from "lucide-react-native";
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

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.3;

interface SwipeableCardProps {
  request: any;
  index: number;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onClose: (id: string) => void;
}

const SwipeableCard = ({
  request,
  index,
  onAccept,
  onReject,
  onClose,
}: SwipeableCardProps) => {
  const translateX = useSharedValue(0);

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
                  {request.id.replace("request_", "HTO")}
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
                numberOfLines={1}
                style={[styles.locationName, index === 0 && styles.whiteText]}
              >
                {request.pickupLocation.split(",")[1]?.trim() ||
                  request.pickupLocation}
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
                {request.distance}km
              </Text>
            </View>

            <View style={styles.locationInfo}>
              <Text
                numberOfLines={1}
                style={[
                  styles.locationName,
                  index === 0 && styles.whiteText,
                  { textAlign: "right" },
                ]}
              >
                {request.dropoffLocation.split(",")[1]?.trim() ||
                  request.dropoffLocation}
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

  const handleAccept = (requestId: string) => {
    console.log("Accepted request:", requestId);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Trip Requests</Text>
          <TouchableOpacity style={styles.headerButton}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{requests.length}</Text>
            </View>
            <Bell size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New Trip Requests</Text>
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
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  handleReject: {
    backgroundColor: Colors.error,
  },
  handleAccept: {
    backgroundColor: Colors.success,
  },
  cardWrapper: {
    marginBottom: 16,
    position: "relative",
  },
  cardBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    justifyContent: "center",
  },
  bgIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
  },
  bgText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  requestCard: {
    backgroundColor: "#2C2C2E", // Dark card for regular requests
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerFirst: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  requestId: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 2,
  },
  fareText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  lightText: {
    color: "rgba(0,0,0,0.6)",
  },
  boldText: {
    fontWeight: "700",
    color: Colors.white,
  },
  whiteText: {
    color: Colors.white,
  },
  trackingButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  trackingButtonFirst: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  trackingText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.white,
  },
  distanceBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 12,
  },
  distanceBadgeFirst: {
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  distanceText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  actionContainer: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButtonFirst: {
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  rejectText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
  acceptButton: {
    flex: 1.5,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  acceptButtonFirst: {
    backgroundColor: Colors.black,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  primaryText: {
    color: Colors.white,
  },
});
