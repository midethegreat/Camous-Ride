import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useNotifications } from "@/providers/NotificationProvider";
import {
  Phone,
  MessageCircle,
  ArrowLeft,
  Navigation,
  Clock,
  ShieldCheck,
  MoreVertical,
} from "lucide-react-native";
import Colors from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

// Mock rider data
const mockRiders = {
  "1": {
    name: "John Doe",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    vehicle: "Toyota Corolla • ABC-123",
    phone: "+234-123-456-7890",
  },
  "2": {
    name: "Sarah Johnson",
    photo:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    vehicle: "Honda Civic • XYZ-456",
    phone: "+234-987-654-3210",
  },
};

export default function LiveTrackingScreen() {
  const router = useRouter();
  const { riderId } = useLocalSearchParams<{ riderId: string }>();
  const { addNotification } = useNotifications();
  const rider =
    mockRiders[riderId as keyof typeof mockRiders] || mockRiders["1"];

  const [status, setStatus] = useState("Heading to pick up your order");
  const [eta, setEta] = useState("8 mins");
  const [distance, setDistance] = useState("2.4 km");

  // Mock coordinates for the rider and destination
  const [riderLocation, setRiderLocation] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
  });

  const destination = {
    latitude: 6.5355,
    longitude: 3.3903,
  };

  useEffect(() => {
    const intervals = [
      { status: "Picking up your order", eta: "6 mins", delay: 5000 },
      { status: "On the way to you", eta: "4 mins", delay: 10000 },
      { status: "Almost there!", eta: "1 min", delay: 15000 },
      { status: "Rider has arrived!", eta: "0 mins", delay: 20000 },
    ];

    const timeouts = intervals.map((step, index) =>
      setTimeout(() => {
        setStatus(step.status);
        setEta(step.eta);
        // Slightly move the rider towards destination
        setRiderLocation((prev) => ({
          latitude:
            prev.latitude + (destination.latitude - prev.latitude) * 0.2,
          longitude:
            prev.longitude + (destination.longitude - prev.longitude) * 0.2,
        }));
      }, step.delay),
    );

    return () => timeouts.forEach((t) => clearTimeout(t));
  }, []);

  const handleConfirmDelivery = () => {
    setStatus("Delivery Confirmed");

    // Add Delivery Confirmed Notification
    addNotification(
      "Order Delivered",
      `Your order from ${rider.name} has been successfully delivered and confirmed. Thank you for using Camous Ride!`,
    );

    setTimeout(() => {
      router.push("/deliveries" as any);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 6.5299,
          longitude: 3.3847,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
      >
        <Marker coordinate={riderLocation}>
          <View style={styles.riderMarker}>
            <Navigation size={20} color={Colors.white} fill={Colors.white} />
          </View>
        </Marker>
        <Marker coordinate={destination}>
          <View style={styles.destinationMarker}>
            <View style={styles.destinationInner} />
          </View>
        </Marker>
        <Polyline
          coordinates={[riderLocation, destination]}
          strokeColor={Colors.primary}
          strokeWidth={3}
          lineDashPattern={[5, 5]}
        />
      </MapView>

      {/* Header Overlay */}
      <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.dark} />
          </TouchableOpacity>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>Live Tracking</Text>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreVertical size={24} color={Colors.dark} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>{status}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={16} color={Colors.gray} />
              <Text style={styles.statText}>
                {eta} • {distance}
              </Text>
            </View>
            <View style={styles.securityBadge}>
              <ShieldCheck size={14} color={Colors.primary} />
              <Text style={styles.securityText}>Secured</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.riderSection}>
          <Image source={{ uri: rider.photo }} style={styles.riderPhoto} />
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>{rider.name}</Text>
            <Text style={styles.vehicleInfo}>{rider.vehicle}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <MessageCircle size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.callButton]}>
              <Phone size={22} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerActions}>
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirmDelivery}
          >
            <Text style={styles.confirmBtnText}>Confirm Product Received</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.detailsBtn}
            onPress={() => router.push("/receipt" as any)}
          >
            <Text style={styles.detailsBtnText}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  map: {
    width: width,
    height: height * 0.7,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginRight: 8,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
  },
  moreButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  riderMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
  },
  destinationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(99, 115, 81, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  destinationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 12,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginBottom: 20,
  },
  statusSection: {
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: "500",
  },
  securityBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  securityText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 20,
  },
  riderSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  riderPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  riderInfo: {
    flex: 1,
    marginLeft: 12,
  },
  riderName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
  },
  vehicleInfo: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    backgroundColor: Colors.primary,
  },
  footerActions: {
    gap: 12,
  },
  confirmBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  detailsBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark,
  },
});
