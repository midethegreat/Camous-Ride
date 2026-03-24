import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  MapPin,
  Clock,
  Star,
  Phone,
  MessageCircle,
  CheckCircle,
  Navigation,
  User,
  ArrowLeft,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useCart } from "@/providers/CartProvider";
import { useNotifications } from "@/providers/NotificationProvider";

const { width } = Dimensions.get("window");

interface Rider {
  id: string;
  name: string;
  photo: string;
  rating: number;
  distance: string;
  eta: string;
  vehicleType: string;
  vehicleNumber: string;
  phone: string;
  isAvailable: boolean;
  currentLocation: string;
}

const mockRiders: Rider[] = [
  {
    id: "1",
    name: "John Doe",
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    distance: "0.5 km",
    eta: "3 min",
    vehicleType: "Motorcycle",
    vehicleNumber: "ABC-123",
    phone: "+234-123-456-7890",
    isAvailable: true,
    currentLocation: "Near campus gate",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    photo:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
    rating: 4.9,
    distance: "0.8 km",
    eta: "5 min",
    vehicleType: "Bicycle",
    vehicleNumber: "XYZ-456",
    phone: "+234-987-654-3210",
    isAvailable: true,
    currentLocation: "Library area",
  },
];

export default function RiderAssignmentScreen() {
  const router = useRouter();
  const { totalAmount, clearCart } = useCart();
  const { addNotification } = useNotifications();
  const [status, setStatus] = useState<"searching" | "matching" | "accepted">(
    "searching",
  );
  const [searchingText, setSearchingText] = useState(
    "Looking for nearby riders...",
  );
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);

  useEffect(() => {
    // Phase 1: Searching for multiple riders
    const phases = [
      { text: "Contacting nearby riders...", delay: 2000 },
      { text: "3 riders found nearby...", delay: 4000 },
      { text: "Waiting for a rider to accept...", delay: 6000 },
    ];

    phases.forEach((phase, index) => {
      setTimeout(() => {
        setSearchingText(phase.text);
        if (index === 1) {
          setStatus("matching");
          addNotification(
            "Riders Found!",
            "We've found 3 riders nearby. Waiting for one to accept your order.",
          );
        }
      }, phase.delay);
    });

    // Phase 2: A rider finally accepts
    const acceptTimeout = setTimeout(() => {
      const rider = mockRiders[Math.floor(Math.random() * mockRiders.length)];
      setSelectedRider(rider);
      setStatus("accepted");

      addNotification(
        "Rider Assigned",
        `${rider.name} has accepted your order and is heading to the restaurant.`,
      );

      // Phase 3: Navigate to live tracking
      const trackTimeout = setTimeout(() => {
        clearCart();
        router.replace({
          pathname: "/live-tracking",
          params: { riderId: rider.id },
        } as any);
      }, 2000);

      return () => clearTimeout(trackTimeout);
    }, 8000);

    return () => {
      clearTimeout(acceptTimeout);
    };
  }, []);

  if (status === "searching" || status === "matching") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finding a Rider</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchingContent}>
          <View style={styles.pulseContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
          <Text style={styles.searchingTitle}>{searchingText}</Text>
          <Text style={styles.searchingSubtitle}>
            We're matching your order with the best available riders in your
            area.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rider Found</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.assignedContent}>
        <View style={styles.riderCard}>
          <Image
            source={{ uri: selectedRider?.photo }}
            style={styles.riderPhoto}
          />
          <Text style={styles.riderName}>{selectedRider?.name}</Text>
          <View style={styles.ratingContainer}>
            <Star size={16} color="#FFD700" fill="#FFD700" />
            <Text style={styles.ratingText}>{selectedRider?.rating}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {status === "assigned"
                ? "Waiting for rider to accept..."
                : "Rider Accepted!"}
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Clock size={20} color={Colors.gray} />
              <Text style={styles.detailValue}>{selectedRider?.eta}</Text>
              <Text style={styles.detailLabel}>ETA</Text>
            </View>
            <View style={styles.detailItem}>
              <Navigation size={20} color={Colors.gray} />
              <Text style={styles.detailValue}>{selectedRider?.distance}</Text>
              <Text style={styles.detailLabel}>Distance</Text>
            </View>
          </View>
        </View>

        {status === "accepted" && (
          <View style={styles.successMessage}>
            <CheckCircle size={40} color={Colors.green} />
            <Text style={styles.successText}>
              Ride accepted! Heading to pick up your order.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7F2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
  },
  searchingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  pulseContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(99, 115, 81, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  searchingTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark,
    textAlign: "center",
  },
  searchingSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
  assignedContent: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  riderCard: {
    backgroundColor: Colors.white,
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  riderPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  riderName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginLeft: 4,
  },
  statusBadge: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 24,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  detailsGrid: {
    flexDirection: "row",
    width: "100%",
    marginTop: 30,
    paddingTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  detailItem: {
    flex: 1,
    alignItems: "center",
  },
  detailValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  successMessage: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 20,
    borderRadius: 20,
    marginTop: 20,
    gap: 12,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#065F46",
  },
});
