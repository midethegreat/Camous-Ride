import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { MapPin, Star, Flame, X } from "lucide-react-native";
import { Colors } from "@/constants/color";
import { BookingNotification } from "@/services/rideBookingService";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureHandlerRootView,
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

interface RideRequestModalProps {
  isVisible: boolean;
  request: BookingNotification | null;
  onAccept: () => void;
  onDecline: () => void;
  onClose?: () => void; // Added optional close prop
}

const RideRequestModal: React.FC<RideRequestModalProps> = ({
  isVisible,
  request,
  onAccept,
  onDecline,
  onClose,
}) => {
  if (!request) return null;

  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  }, [translateX]); // Added dependency to prevent render access issues

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
          ? `rgba(4, 120, 87, ${opacityAccept})` // Green for accept
          : `rgba(220, 38, 38, ${opacityReject})`, // Red for reject
    };
  }, [translateX]); // Added dependency

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    translateX.value = event.nativeEvent.translationX;
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === 5) {
      // State.END
      if (translateX.value > SWIPE_THRESHOLD) {
        // Swipe Right -> Accept
        translateX.value = withSpring(width, { damping: 20, stiffness: 200 });
        runOnJS(onAccept)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        // Swipe Left -> Reject
        translateX.value = withSpring(-width, { damping: 20, stiffness: 200 });
        runOnJS(onDecline)();
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    }
  };

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View style={[styles.modalContent, animatedStyle]}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  styles.swipeBackground,
                  bgStyle,
                ]}
              />

              {/* Top Header with Close Button */}
              <View style={styles.topHeader}>
                <View style={styles.profitablyContainer}>
                  <Text style={styles.profitablyText}>Profitably</Text>
                  <Flame
                    size={16}
                    color={Colors.primary}
                    fill={Colors.primary}
                  />
                </View>

                <View style={styles.headerRight}>
                  <View style={styles.appLogo}>
                    <Text style={styles.logoText}>C</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose || onDecline}
                  >
                    <X size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Passenger Info Row */}
              <View style={styles.passengerRow}>
                <Image
                  source={{ uri: request.passengerAvatar }}
                  style={styles.avatar}
                />
                <View style={styles.passengerDetails}>
                  <Text style={styles.passengerName}>
                    {request.passengerName}
                  </Text>
                  <Text style={styles.paymentMethod}>
                    {request.paymentMethod}
                  </Text>
                </View>
                <View style={styles.fareContainer}>
                  <Text style={styles.fareAmount}>
                    ₦{request.fare.toLocaleString()}
                  </Text>
                  <Text style={styles.distanceText}>{request.distance} km</Text>
                </View>
              </View>

              {/* Route Section */}
              <View style={styles.routeSection}>
                <View style={styles.routeIcons}>
                  <View style={styles.pickupDot} />
                  <View style={styles.routeLine} />
                  <MapPin
                    size={18}
                    color={Colors.primary}
                    fill={Colors.primary}
                  />
                </View>
                <View style={styles.routeDetails}>
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Pickup point</Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {request.pickupLocation}
                    </Text>
                  </View>
                  <View style={styles.locationDivider} />
                  <View style={styles.locationItem}>
                    <Text style={styles.locationLabel}>Pickout point</Text>
                    <Text style={styles.locationText} numberOfLines={1}>
                      {request.dropoffLocation}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.declineButton}
                  onPress={onDecline}
                >
                  <Text style={styles.declineText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={onAccept}
                >
                  <Text style={styles.acceptText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </PanGestureHandler>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end", // Push towards bottom
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 80, // A few inches away from the very bottom
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden", // Added to clip swipe background
  },
  swipeBackground: {
    zIndex: -1,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    zIndex: 1, // Ensure header is above swipe background
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeBtn: {
    padding: 4,
  },
  profitablyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  profitablyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  appLogo: {
    width: 28,
    height: 28,
    backgroundColor: Colors.primary,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    marginRight: 12,
  },
  passengerDetails: {
    flex: 1,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 2,
  },
  paymentMethod: {
    fontSize: 14,
    color: Colors.primary, // Using primary green
    fontWeight: "500",
  },
  fareContainer: {
    alignItems: "flex-end",
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },
  distanceText: {
    fontSize: 14,
    color: "#BBBBBB",
    marginTop: 2,
  },
  routeSection: {
    flexDirection: "row",
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  routeIcons: {
    alignItems: "center",
    marginRight: 15,
    paddingVertical: 5,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: Colors.primary,
    backgroundColor: "white",
  },
  routeLine: {
    width: 1,
    flex: 1,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#DDDDDD",
    marginVertical: 4,
  },
  routeDetails: {
    flex: 1,
    gap: 15,
  },
  locationItem: {
    gap: 4,
  },
  locationLabel: {
    fontSize: 13,
    color: "#AAAAAA",
    fontWeight: "500",
  },
  locationText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  locationDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 15,
  },
  declineButton: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  declineText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  acceptButton: {
    flex: 1.5,
    height: 56,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
});

export default RideRequestModal;
