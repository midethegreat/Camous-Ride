import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import {
  ArrowLeft,
  Navigation,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
} from "lucide-react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/color";

const { width, height } = Dimensions.get("window");

const mapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#f0f0f0" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#94d3f3" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffffff" }]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [{ "color": "#ffeb3b" }]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [{ "color": "#c5e1a5" }]
  }
];

export default function ActiveTripScreen() {
  const router = useRouter();
  const [eta, setEta] = useState(12);
  const [region, setRegion] = useState({
    latitude: 6.5244,
    longitude: 3.3792,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Mock coordinates for pickup and dropoff
  const pickupCoords = { latitude: 6.53, longitude: 3.38 };
  const dropoffCoords = { latitude: 6.51, longitude: 3.36 };
  const driverCoords = { latitude: 6.52, longitude: 3.37 };

  // Simulate ETA decreasing
  useEffect(() => {
    const timer = setInterval(() => {
      setEta((prev) => (prev > 1 ? prev - 1 : 1));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Map Background */}
      <View style={styles.mapContainer}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          customMapStyle={mapStyle}
        >
          {/* Driver Marker */}
          <Marker coordinate={driverCoords}>
            <View style={styles.driverMarker}>
              <Navigation size={18} color="white" fill="white" />
            </View>
          </Marker>

          {/* Pickup Marker */}
          <Marker coordinate={pickupCoords}>
            <View style={styles.pickupMarker}>
              <View style={styles.pickupDot} />
            </View>
          </Marker>

          {/* Dropoff Marker */}
          <Marker coordinate={dropoffCoords}>
            <View style={styles.dropoffMarker}>
              <MapPin size={24} color="white" fill="white" />
            </View>
          </Marker>

          {/* Route Line */}
          <Polyline
            coordinates={[driverCoords, pickupCoords, dropoffCoords]}
            strokeColor={Colors.primary}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        </MapView>

        {/* Back Button Overlay */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Trip Info Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        <View style={styles.header}>
          <View>
            <Text style={styles.etaTitle}>Arriving in</Text>
            <Text style={styles.etaValue}>{eta} mins</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>₦250</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.passengerSection}>
          <View style={styles.passengerInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>AR</Text>
            </View>
            <View>
              <Text style={styles.passengerName}>Alex Rodriguez</Text>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>★ 4.6</Text>
              </View>
            </View>
          </View>
          <View style={styles.contactIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <MessageCircle size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Phone size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <Clock size={18} color={Colors.textMuted} />
            <Text style={styles.routeText}>Pickup: 888 Market St, Central</Text>
          </View>
          <View style={styles.routeItem}>
            <Navigation size={18} color={Colors.textMuted} />
            <Text style={styles.routeText}>Dropoff: 222 Park Ave, North</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            router.push("/(tabs)");
          }}
        >
          <Text style={styles.primaryButtonText}>Complete Trip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverMarker: {
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
  pickupMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  dropoffMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.error,
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
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  etaTitle: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  etaValue: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
  },
  priceBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  priceText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: 20,
  },
  passengerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "700",
    color: Colors.text,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  ratingContainer: {
    marginTop: 2,
  },
  ratingText: {
    fontSize: 12,
    color: Colors.warning,
    fontWeight: "600",
  },
  contactIcons: {
    flexDirection: "row",
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary + "10", // 10% opacity
    justifyContent: "center",
    alignItems: "center",
  },
  routeSection: {
    gap: 12,
    marginBottom: 30,
  },
  routeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  routeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
});
