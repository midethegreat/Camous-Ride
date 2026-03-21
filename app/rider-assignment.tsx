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
import {
  MapPin,
  Clock,
  Star,
  Phone,
  MessageCircle,
  CheckCircle,
  Navigation,
  User,
} from "lucide-react-native";
import Colors from "@/constants/Colors";

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

interface OrderDetails {
  id: string;
  restaurantName: string;
  totalAmount: number;
  estimatedDeliveryTime: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
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
  {
    id: "3",
    name: "Mike Wilson",
    photo:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.6,
    distance: "1.2 km",
    eta: "7 min",
    vehicleType: "Motorcycle",
    vehicleNumber: "DEF-789",
    phone: "+234-456-789-0123",
    isAvailable: false,
    currentLocation: "Delivering nearby",
  },
];

interface RiderAssignmentProps {
  orderDetails: OrderDetails;
  onRiderSelected: (rider: Rider) => void;
  onBack: () => void;
}

export default function RiderAssignment({
  orderDetails,
  onRiderSelected,
  onBack,
}: RiderAssignmentProps) {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentComplete, setAssignmentComplete] = useState(false);

  const availableRiders = mockRiders.filter((rider) => rider.isAvailable);

  const handleRiderSelect = async (rider: Rider) => {
    setSelectedRider(rider);
    setIsAssigning(true);

    // Simulate assignment process
    setTimeout(() => {
      setIsAssigning(false);
      setAssignmentComplete(true);

      // Notify parent component
      setTimeout(() => {
        onRiderSelected(rider);
      }, 2000);
    }, 2000);
  };

  const renderRiderCard = (rider: Rider) => {
    const isSelected = selectedRider?.id === rider.id;
    const isAssigned = assignmentComplete && isSelected;

    return (
      <TouchableOpacity
        key={rider.id}
        style={[
          styles.riderCard,
          isSelected && styles.riderCardSelected,
          isAssigned && styles.riderCardAssigned,
        ]}
        onPress={() => handleRiderSelect(rider)}
        disabled={isAssigning || assignmentComplete}
      >
        <View style={styles.riderHeader}>
          <Image source={{ uri: rider.photo }} style={styles.riderPhoto} />
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>{rider.name}</Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.ratingText}>{rider.rating}</Text>
            </View>
          </View>
          {isAssigned && (
            <CheckCircle size={24} color={Colors.green} fill={Colors.green} />
          )}
        </View>

        <View style={styles.riderDetails}>
          <View style={styles.detailRow}>
            <Navigation size={16} color={Colors.gray} />
            <Text style={styles.detailText}>
              {rider.distance} • {rider.eta}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MapPin size={16} color={Colors.gray} />
            <Text style={styles.detailText}>{rider.currentLocation}</Text>
          </View>
          <View style={styles.detailRow}>
            <User size={16} color={Colors.gray} />
            <Text style={styles.detailText}>
              {rider.vehicleType} • {rider.vehicleNumber}
            </Text>
          </View>
        </View>

        {isSelected && isAssigning && (
          <View style={styles.assigningOverlay}>
            <ActivityIndicator size="large" color={Colors.white} />
            <Text style={styles.assigningText}>Assigning rider...</Text>
          </View>
        )}

        {isAssigned && (
          <View style={styles.assignedOverlay}>
            <CheckCircle size={32} color={Colors.white} fill={Colors.white} />
            <Text style={styles.assignedText}>Rider Assigned!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (assignmentComplete && selectedRider) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <CheckCircle size={80} color={Colors.green} fill={Colors.green} />
          </View>
          <Text style={styles.successTitle}>Rider Assigned Successfully!</Text>
          <Text style={styles.successSubtitle}>
            {selectedRider.name} will deliver your order
          </Text>
          <Text style={styles.successEta}>
            Estimated arrival: {selectedRider.eta}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Rider</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Order Summary */}
      <View style={styles.orderSummary}>
        <Text style={styles.orderTitle}>Order #{orderDetails.id}</Text>
        <Text style={styles.orderRestaurant}>
          {orderDetails.restaurantName}
        </Text>
        <Text style={styles.orderAmount}>
          ₦{orderDetails.totalAmount.toFixed(2)}
        </Text>
        <Text style={styles.orderAddress}>{orderDetails.deliveryAddress}</Text>
      </View>

      {/* Available Riders */}
      <ScrollView style={styles.ridersContainer}>
        <Text style={styles.sectionTitle}>
          Available Riders ({availableRiders.length})
        </Text>
        {availableRiders.map(renderRiderCard)}
      </ScrollView>

      {isAssigning && (
        <View style={styles.assigningFooter}>
          <ActivityIndicator size="small" color={Colors.white} />
          <Text style={styles.assigningFooterText}>
            Please wait while we assign your rider...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 20,
    color: Colors.dark,
  },
  headerSpacer: {
    width: 40,
  },
  orderSummary: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  orderTitle: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 4,
  },
  orderRestaurant: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 8,
  },
  orderAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 8,
  },
  orderAddress: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  ridersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  riderCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  riderCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  riderCardAssigned: {
    borderColor: Colors.green,
    backgroundColor: Colors.greenLight,
  },
  riderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  riderPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    color: Colors.dark,
    marginLeft: 4,
    fontWeight: "600",
  },
  riderDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  assigningOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(27, 122, 67, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  assigningText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "600",
    marginTop: 12,
  },
  assignedOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  assignedText: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: "700",
    marginTop: 12,
  },
  assigningFooter: {
    backgroundColor: Colors.primary,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  assigningFooterText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: "600",
  },
  successContent: {
    alignItems: "center",
    padding: 40,
  },
  successIcon: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 8,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  successEta: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    textAlign: "center",
  },
});
