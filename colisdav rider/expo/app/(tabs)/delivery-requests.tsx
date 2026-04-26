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
  Modal,
} from "react-native";
import {
  ArrowLeft,
  Package,
  MapPin,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  History,
  X,
} from "lucide-react-native";
import * as Location from "expo-location";
import { useRouter, useNavigation } from "expo-router";
import { Colors } from "@/constants/color";

const { width } = Dimensions.get("window");

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
      const parts = [];
      if (address.name && address.name !== address.street)
        parts.push(address.name);
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.district) parts.push(address.district);

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

interface DeliveryCardProps {
  item: any;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const DeliveryCard = ({ item, onAccept, onDecline }: DeliveryCardProps) => {
  const [pickupName, setPickupName] = useState(item.pickup);
  const [dropoffName, setDropoffName] = useState(item.dropoff);

  useEffect(() => {
    const resolveNames = async () => {
      const coordsRegex = /^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/;
      const pickupCoords = item.pickup.match(coordsRegex);
      const dropoffCoords = item.dropoff.match(coordsRegex);

      if (pickupCoords || dropoffCoords) {
        if (pickupCoords) {
          const name = await getLocationName(
            parseFloat(pickupCoords[1]),
            parseFloat(pickupCoords[2]),
          );
          setPickupName(name);
        }
        if (dropoffCoords) {
          const name = await getLocationName(
            parseFloat(dropoffCoords[1]),
            parseFloat(dropoffCoords[2]),
          );
          setDropoffName(name);
        }
      }
    };
    resolveNames();
  }, [item.pickup, item.dropoff]);

  return (
    <View style={styles.requestCard}>
      <View style={styles.cardHeader}>
        <View style={styles.idContainer}>
          <Package size={18} color={Colors.primary} />
          <Text style={styles.requestId}>{item.id}</Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>

      <View style={styles.restaurantSection}>
        <Text style={styles.restaurantName}>{item.restaurant}</Text>
        <Text style={styles.itemsText}>{item.items}</Text>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Clock size={16} color={Colors.textSecondary} />
          <Text style={styles.detailText}>{item.distance}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Earning:</Text>
          <Text style={styles.priceValue}>₦{item.fare.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.locationSection}>
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {pickupName}
          </Text>
        </View>
        <View style={styles.locationLine} />
        <View style={styles.locationRow}>
          <View style={[styles.dot, { backgroundColor: Colors.error }]} />
          <Text style={styles.locationText} numberOfLines={1}>
            {dropoffName}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.declineBtn}
          onPress={() => onDecline(item.id)}
        >
          <Text style={styles.declineBtnText}>Decline</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => onAccept(item.id)}
        >
          <Text style={styles.acceptBtnText}>Accept Delivery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function DeliveryRequestsScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  // Mock Data for Delivery Requests
  const mockDeliveryRequests = [
    {
      id: "DEL-1024",
      restaurant: "Mama Put Special",
      items: "2x Jollof Rice, 1x Chicken",
      fare: 1500,
      distance: "2.5km",
      pickup: "Alaba Street, FUNAAB",
      dropoff: "Hostel A, Gate",
      time: "5 mins ago",
    },
    {
      id: "DEL-1025",
      restaurant: "Crunchies Fried Chicken",
      items: "1x Family Pack, 2x Drinks",
      fare: 2200,
      distance: "4.8km",
      pickup: "Crunchies, Camp",
      dropoff: "Motion Ground, FUNAAB",
      time: "12 mins ago",
    },
  ];

  const mockHistory = [
    {
      id: "DEL-1020",
      status: "accepted",
      price: 1800,
      date: "2024-03-20",
      restaurant: "Kilimanjaro",
    },
    {
      id: "DEL-1021",
      status: "declined",
      price: 1200,
      date: "2024-03-20",
      restaurant: "The Place",
    },
    {
      id: "DEL-1022",
      status: "accepted",
      price: 2500,
      date: "2024-03-19",
      restaurant: "Chicken Republic",
    },
  ];

  const [requests, setRequests] = useState(mockDeliveryRequests);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("headerLeftPress" as any, () => {
      setShowHistory(true);
    });
    return unsubscribe;
  }, [navigation]);

  const handleAccept = (id: string) => {
    Alert.alert("Success", `Delivery ${id} accepted!`);
    setRequests(requests.filter((r) => r.id !== id));
  };

  const handleDecline = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Deliveries</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{requests.length}</Text>
          </View>
        </View>

        {requests.map((item) => (
          <DeliveryCard
            key={item.id}
            item={item}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        ))}

        {requests.length === 0 && (
          <View style={styles.emptyState}>
            <Package size={64} color={Colors.borderLight} />
            <Text style={styles.emptyText}>No delivery requests available</Text>
          </View>
        )}
      </ScrollView>

      {/* History Modal */}
      <Modal
        visible={showHistory}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delivery History</Text>
              <TouchableOpacity onPress={() => setShowHistory(false)}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList}>
              {mockHistory.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyId}>{item.id}</Text>
                    <Text style={styles.historyRestaurant}>{item.restaurant}</Text>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                  <View style={styles.historyStatus}>
                    <Text style={styles.historyPrice}>₦{item.price.toLocaleString()}</Text>
                    <View style={[
                      styles.statusBadge, 
                      { backgroundColor: item.status === 'accepted' ? '#E6F4EA' : '#FCE8E6' }
                    ]}>
                      {item.status === 'accepted' ? (
                        <CheckCircle2 size={12} color="#1E8E3E" />
                      ) : (
                        <XCircle size={12} color="#D93025" />
                      )}
                      <Text style={[
                        styles.statusText,
                        { color: item.status === 'accepted' ? '#1E8E3E' : '#D93025' }
                      ]}>
                        {item.status === 'accepted' ? 'Accepted' : 'Declined'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  backButton: {
    padding: 5,
  },
  historyButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  requestCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requestId: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  restaurantSection: {
    marginBottom: 15,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  itemsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 15,
  },
  locationSection: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  locationLine: {
    width: 1,
    height: 15,
    backgroundColor: Colors.borderLight,
    marginLeft: 3.5,
    marginVertical: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  acceptBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: '80%',
    padding: 25,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
  },
  historyList: {
    flex: 1,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  historyInfo: {
    flex: 1,
  },
  historyId: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  historyRestaurant: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  historyDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyStatus: {
    alignItems: 'flex-end',
  },
  historyPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
