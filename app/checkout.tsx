import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import {
  ArrowLeft,
  Wallet,
  Landmark,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Crosshair,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useCart } from "@/providers/CartProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useNotifications } from "@/providers/NotificationProvider";

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { totalAmount, clearCart, cart } = useCart();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "bank" | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState<string>("");
  const [deliveryFee, setDeliveryFee] = useState<number>(500);
  const [locationName, setLocationName] = useState<string>(
    "Getting location...",
  );

  // Get restaurant WhatsApp number from navigation params
  const restaurantWhatsApp =
    (params.restaurantWhatsApp as string) || "+2348012345678"; // Default fallback

  const grandTotal = totalAmount + deliveryFee;

  // Get location name based on coordinates (simplified geocoding)
  const getLocationName = (lat: number, lon: number): string => {
    // Check if it's near FUNAAB campus
    const campusCenter = { latitude: 7.231, longitude: 3.44 };
    const distance = calculateDistance(
      lat,
      lon,
      campusCenter.latitude,
      campusCenter.longitude,
    );

    if (distance <= 0.5) {
      return "FUNAAB Campus";
    } else if (distance <= 2) {
      return "Around FUNAAB";
    } else if (distance <= 5) {
      return "Abeokuta Area";
    } else if (lat > 7.0 && lat < 7.5 && lon > 3.0 && lon < 3.8) {
      return "Ogun State";
    } else {
      return "Nigeria";
    }
  };

  // Calculate delivery fee based on distance from campus center
  const calculateDeliveryFee = (userLat: number, userLon: number) => {
    const campusCenter = { latitude: 7.231, longitude: 3.44 }; // FUNAAB center
    const distance = calculateDistance(
      userLat,
      userLon,
      campusCenter.latitude,
      campusCenter.longitude,
    );

    if (distance <= 2) {
      // Within 2km of campus
      return 500;
    } else if (distance <= 5) {
      // 2-5km from campus
      return 1000;
    } else {
      // Beyond 5km
      return 1500;
    }
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) => {
    const R = 6371; // Earth's radius in km
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

  // Send order details to restaurant via WhatsApp
  const sendOrderToWhatsApp = async (orderDetails: any) => {
    try {
      const message = `
🍕 NEW FOOD ORDER 🍕

Order ID: ${orderDetails.orderId}
Customer: ${user?.name || "Guest"}
Phone: ${user?.phone || "N/A"}

📍 Delivery Location:
${deliveryLocation}

🍽️ Order Items:
${orderDetails.items
  .map(
    (item: any) =>
      `• ${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`,
  )
  .join("\n")}

💰 Order Summary:
Subtotal: ₦${totalAmount.toLocaleString()}
Delivery Fee: ₦${deliveryFee.toLocaleString()}
Total: ₦${grandTotal.toLocaleString()}

🚚 Delivery Instructions:
Please deliver to the specified location.

⏰ Order Time: ${new Date().toLocaleString()}

---
Powered by CID Food Delivery
      `;

      const whatsappUrl = `https://wa.me/${restaurantWhatsApp}?text=${encodeURIComponent(message)}`;

      // In a real app, this would be sent via API to the restaurant
      console.log("WhatsApp message prepared:", message);
      console.log("WhatsApp URL:", whatsappUrl);

      // For now, we'll just log it. In production, you'd send this via your backend
      // or use a WhatsApp Business API
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
    }
  };

  // Get current location on component mount
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          const { latitude, longitude } = location.coords;
          const fee = calculateDeliveryFee(latitude, longitude);
          setDeliveryFee(fee);

          // Get readable address name
          try {
            const [address] = await Location.reverseGeocodeAsync({
              latitude,
              longitude,
            });
            if (address) {
              const name = [
                address.name,
                address.street,
                address.district,
                address.city,
              ]
                .filter(Boolean)
                .join(", ");
              setDeliveryLocation(
                name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              );
            } else {
              setDeliveryLocation(
                `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              );
            }
          } catch (geoError) {
            setDeliveryLocation(
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            );
          }
        } else {
          // Default to campus location if permission denied
          setDeliveryLocation("FUNAAB Campus");
          setDeliveryFee(500);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        setDeliveryLocation("FUNAAB Campus");
        setDeliveryFee(500);
      }
    };

    getCurrentLocation();
  }, []);

  // Handle manual location input
  const handleLocationChange = (text: string) => {
    setDeliveryLocation(text);
    // For manual locations, use default fee calculation
    if (
      text.toLowerCase().includes("funaab") ||
      text.toLowerCase().includes("campus")
    ) {
      setDeliveryFee(500);
    } else {
      setDeliveryFee(1000);
    }
  };

  // Get current GPS location
  const getGPSLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = location.coords;
        const fee = calculateDeliveryFee(latitude, longitude);
        setDeliveryFee(fee);

        // Get readable address name
        try {
          const [address] = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          if (address) {
            const name = [
              address.name,
              address.street,
              address.district,
              address.city,
            ]
              .filter(Boolean)
              .join(", ");
            setDeliveryLocation(
              name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            );
          } else {
            setDeliveryLocation(
              `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            );
          }
        } catch (geoError) {
          setDeliveryLocation(
            `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          );
        }
      } else {
        Alert.alert(
          "Permission Required",
          "Please enable location services to get accurate delivery fee.",
        );
      }
    } catch (error) {
      console.error("Error getting GPS location:", error);
      Alert.alert("Location Error", "Unable to get your current location.");
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      Alert.alert("Error", "Please select a payment method");
      return;
    }

    if (paymentMethod === "wallet") {
      if ((user?.walletBalance || 0) < grandTotal) {
        Alert.alert(
          "Insufficient Balance",
          "Your wallet balance is too low for this order.",
        );
        return;
      }
      processPayment();
    } else {
      setShowBankDetails(true);
    }
  };

  const processPayment = () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);

      // Add Payment Success Notification
      addNotification(
        "Payment Successful",
        `Your payment of ₦${grandTotal.toLocaleString()} for your order was successful.`,
      );

      // Add Promo Notification
      addNotification(
        "New Promo Unlocked!",
        "Congratulations! You've unlocked a 10% discount on your next delivery.",
      );

      // Send order details to restaurant via WhatsApp
      const orderDetails = {
        orderId: `ORD-${Date.now()}`,
        items: [], // This would come from cart items
        deliveryLocation: deliveryLocation,
        totalAmount: totalAmount,
        deliveryFee: deliveryFee,
        grandTotal: grandTotal,
      };

      sendOrderToWhatsApp(orderDetails);

      router.push("/rider-assignment" as any);
    }, 2000);
  };

  const handleBankTransferDone = () => {
    setShowBankDetails(false);
    processPayment();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₦{totalAmount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>
                ₦{deliveryFee.toLocaleString()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>
                ₦{grandTotal.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <View style={styles.locationContainer}>
            <View style={styles.locationInputContainer}>
              <MapPin size={20} color={Colors.primary} />
              <TextInput
                style={styles.locationInput}
                placeholder="Enter delivery address or use GPS"
                value={deliveryLocation}
                onChangeText={handleLocationChange}
                multiline
              />
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={getGPSLocation}
              >
                <Crosshair size={18} color={Colors.white} />
              </TouchableOpacity>
            </View>
            <Text style={styles.deliveryFeeText}>
              Delivery Fee: ₦{deliveryFee.toLocaleString()}
            </Text>
            <Text style={styles.deliveryInfo}>
              Fee calculated based on distance from restaurant
            </Text>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === "wallet" && styles.paymentCardActive,
            ]}
            onPress={() => setPaymentMethod("wallet")}
          >
            <View style={styles.paymentIconContainer}>
              <Wallet
                size={24}
                color={
                  paymentMethod === "wallet" ? Colors.white : Colors.primary
                }
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Wallet Balance</Text>
              <Text style={styles.paymentSub}>
                Available: ₦{(user?.walletBalance || 0).toLocaleString()}
              </Text>
            </View>
            {paymentMethod === "wallet" && (
              <CheckCircle2 size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentCard,
              paymentMethod === "bank" && styles.paymentCardActive,
            ]}
            onPress={() => setPaymentMethod("bank")}
          >
            <View style={styles.paymentIconContainer}>
              <Landmark
                size={24}
                color={paymentMethod === "bank" ? Colors.white : Colors.primary}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Bank Transfer</Text>
              <Text style={styles.paymentSub}>
                Pay via secure bank transfer
              </Text>
            </View>
            {paymentMethod === "bank" && (
              <CheckCircle2 size={20} color={Colors.primary} />
            )}
          </TouchableOpacity>
        </View>

        {showBankDetails && (
          <View style={styles.bankDetailsCard}>
            <Text style={styles.bankDetailsTitle}>
              Bank Transfer Instructions
            </Text>
            <Text style={styles.bankDetailsText}>
              Please transfer the total amount to the account below:
            </Text>

            <View style={styles.bankAccountInfo}>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Bank Name</Text>
                <Text style={styles.bankValue}>Kuda Bank</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Account Number</Text>
                <Text style={styles.bankValue}>2012345678</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Account Name</Text>
                <Text style={styles.bankValue}>Camous Ride Ltd</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Amount</Text>
                <Text style={styles.bankValue}>
                  ₦{grandTotal.toLocaleString()}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.bankDoneBtn}
              onPress={handleBankTransferDone}
            >
              <Text style={styles.bankDoneBtnText}>
                I have made the transfer
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {!showBankDetails && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.payBtn, isProcessing && styles.payBtnDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <Text style={styles.payBtnText}>
              {isProcessing
                ? "Processing..."
                : `Pay ₦${grandTotal.toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.primary,
  },
  areaContainer: {
    flexDirection: "row",
    gap: 12,
  },
  areaCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  areaCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  areaText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 8,
    textAlign: "center",
  },
  areaTextActive: {
    color: Colors.white,
  },
  areaPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    marginTop: 4,
  },
  areaPriceActive: {
    color: "rgba(255,255,255,0.8)",
  },
  locationContainer: {
    marginTop: 16,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.dark,
    minHeight: 40,
  },
  gpsButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 8,
    marginLeft: 8,
  },
  deliveryFeeText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 12,
  },
  deliveryInfo: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
  },
  paymentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentCardActive: {
    borderColor: Colors.primary,
    backgroundColor: "#F0FDF4",
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
  paymentSub: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  footer: {
    padding: 20,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  payBtn: {
    backgroundColor: "#637351",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  payBtnDisabled: {
    opacity: 0.7,
  },
  payBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  bankDetailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginTop: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  bankDetailsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
    marginBottom: 12,
  },
  bankDetailsText: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 20,
    lineHeight: 20,
  },
  bankAccountInfo: {
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  bankRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bankLabel: {
    fontSize: 13,
    color: Colors.gray,
  },
  bankValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark,
  },
  bankDoneBtn: {
    backgroundColor: Colors.primary,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  bankDoneBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
