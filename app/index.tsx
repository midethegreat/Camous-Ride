import * as Location from "expo-location";
import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  ScrollView,
  Modal,
  Image,
  PanResponder,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Menu,
  ShieldCheck,
  Crosshair,
  MapPin,
  Minus,
  Plus,
  Ticket,
  MessageCircle,
  Bell,
  ChevronUp,
  X,
  ChevronRight,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/_constants/Colors";
import { CAMPUS_CENTER, CAMPUS_LOCATIONS } from "@/_constants/campus";
import { useAuth } from "@/_providers/AuthProvider";
import DrawerMenu from "@/_components/DrawerMenu";
import LeafletMap from "@/_components/LeafletMap";
import { MOCK_VOUCHERS } from "@/_mocks/data";
import { CampusLocation, Voucher } from "@/_types";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const COLLAPSED_HEIGHT = 90;
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.55;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [bookingExpanded, setBookingExpanded] = useState<boolean>(false);
  const [pickup, setPickup] = useState<CampusLocation | null>(null);
  const [destination, setDestination] = useState<CampusLocation | null>(null);
  const [passengers, setPassengers] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<string>("Wallet");
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [showVoucherModal, setShowVoucherModal] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [pickingFor, setPickingFor] = useState<"pickup" | "destination">(
    "destination",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [userFollowsMap, setUserFollowsMap] = useState(true);
  const [mapCenter, setMapCenter] = useState(CAMPUS_CENTER);
  const sheetHeight = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const nearestCampusFor = (
    lat: number,
    lon: number,
  ): CampusLocation | null => {
    let closest: CampusLocation | null = null;
    let minD = Infinity;
    for (const loc of CAMPUS_LOCATIONS) {
      const d =
        Math.pow(loc.latitude - lat, 2) + Math.pow(loc.longitude - lon, 2);
      if (d < minD) {
        minD = d;
        closest = loc;
      }
    }
    return closest;
  };
  const fabPulse = useRef(new Animated.Value(1)).current;
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>({
      coords: {
        latitude: CAMPUS_CENTER.latitude,
        longitude: CAMPUS_CENTER.longitude,
        altitude: 0,
        accuracy: 100,
        altitudeAccuracy: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    });

  const [backendFare, setBackendFare] = useState<number>(200);
  const [loadingFare, setLoadingFare] = useState(false);

  const finalFare = useMemo(() => {
    const base = backendFare * passengers;
    const discount = selectedVoucher?.discount ?? 0;
    return Math.max(base - discount, 0);
  }, [backendFare, passengers, selectedVoucher]);

  useEffect(() => {
    const fetchFare = async () => {
      if (!pickup || !destination) return;

      try {
        setLoadingFare(true);
        // Estimate distance (simple straight line for now, or use a routing API)
        const dist =
          Math.sqrt(
            Math.pow(destination.latitude - pickup.latitude, 2) +
              Math.pow(destination.longitude - pickup.longitude, 2),
          ) * 111; // Approx km

        const response = await fetch(`${API_URL}/api/rides/calculate-fare`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            distanceKm: dist,
            durationMinutes: 5, // Mock duration
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setBackendFare(data.fare);
        }
      } catch (error) {
        console.error("Fare fetch error:", error);
      } finally {
        setLoadingFare(false);
      }
    };

    fetchFare();
  }, [pickup, destination]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    const startWatching = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 5000,
              distanceInterval: 10,
            },
            (newLocation) => {
              setUserLocation(newLocation);
            },
          );
        }
      } catch (error) {
        console.warn("Location permission failed, using default location");
      }
    };
    startWatching();
    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (userLocation) {
      const userLat = userLocation.coords.latitude;
      const userLon = userLocation.coords.longitude;
      const nearest = nearestCampusFor(userLat, userLon);
      if (
        nearest &&
        (userFollowsMap || !pickup || pickup.id === "my-location")
      ) {
        setPickup(nearest);
      }
      setMapCenter({ latitude: userLat, longitude: userLon });
    }
  }, [userLocation, userFollowsMap]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulse, {
          toValue: 1.12,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulse, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const expandSheet = () => {
    setBookingExpanded(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(sheetHeight, {
      toValue: EXPANDED_HEIGHT,
      tension: 65,
      friction: 12,
      useNativeDriver: false,
    }).start();
  };

  const collapseSheet = () => {
    setBookingExpanded(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(sheetHeight, {
      toValue: COLLAPSED_HEIGHT,
      tension: 65,
      friction: 12,
      useNativeDriver: false,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 5,
      onPanResponderMove: (_, gestureState) => {
        const currentHeight = bookingExpanded
          ? EXPANDED_HEIGHT
          : COLLAPSED_HEIGHT;
        const newHeight = currentHeight - gestureState.dy;
        const clampedHeight = Math.max(
          COLLAPSED_HEIGHT,
          Math.min(EXPANDED_HEIGHT, newHeight),
        );
        sheetHeight.setValue(clampedHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        const midpoint = (EXPANDED_HEIGHT + COLLAPSED_HEIGHT) / 2;
        const currentHeight = bookingExpanded
          ? EXPANDED_HEIGHT
          : COLLAPSED_HEIGHT;
        const projectedHeight = currentHeight - gestureState.dy;
        if (gestureState.dy < -50 || projectedHeight > midpoint) {
          expandSheet();
        } else {
          collapseSheet();
        }
      },
    }),
  ).current;

  const handleMarkerPress = (loc: CampusLocation) => {
    if (!loc || !loc.id) return;
    setDestination(loc);
    expandSheet();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredLocations = useMemo(() => {
    if (searchQuery) {
      return CAMPUS_LOCATIONS.filter((location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return CAMPUS_LOCATIONS;
  }, [searchQuery]);

  const handleConfirm = () => {
    if (!pickup || !destination) return;
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/booking-confirm" as never,
      params: {
        pickup: pickup.name,
        destination: destination.name,
        fare: finalFare.toString(),
        passengers: passengers.toString(),
        paymentMethod,
        voucher: selectedVoucher?.code ?? "",
        verificationCode,
      },
    });
  };

  const openLocationPicker = (type: "pickup" | "destination") => {
    setPickingFor(type);
    setShowLocationPicker(true);
  };

  const selectLocation = (loc: CampusLocation) => {
    if (pickingFor === "pickup") {
      setPickup(loc);
      setUserFollowsMap(false);
    } else {
      setDestination(loc);
    }
    setShowLocationPicker(false);
    setSearchQuery("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderMap = () => {
    if (Platform.OS === "web") {
      return (
        <View style={styles.webMap}>
          <View style={styles.webMapGrid}>
            {CAMPUS_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={[
                  styles.webMapPin,
                  destination?.id === loc.id && styles.webMapPinActive,
                ]}
                onPress={() => handleMarkerPress(loc)}
              >
                <MapPin
                  size={14}
                  color={
                    destination?.id === loc.id ? Colors.white : Colors.primary
                  }
                />
                <Text
                  style={[
                    styles.webMapPinText,
                    destination?.id === loc.id && styles.webMapPinTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {loc.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return (
      <LeafletMap
        pickup={pickup}
        destination={destination}
        onMarkerPress={handleMarkerPress}
        center={mapCenter}
        locations={CAMPUS_LOCATIONS}
        zoom={17}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderMap()}

      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setDrawerOpen(true)}
        >
          <Menu size={22} color={Colors.dark} />
        </TouchableOpacity>

        <View style={styles.safeBadge}>
          <ShieldCheck size={16} color={Colors.primary} />
          <Text style={styles.safeText}>KEKE SAFE</Text>
        </View>

        <View style={styles.topRight}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/notifications" as never)}
          >
            <Bell size={20} color={Colors.dark} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => router.push("/profile" as never)}
          >
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarLetter}>
                {user?.fullName?.charAt(0) ?? "U"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        style={[
          styles.bookingSheet,
          { height: sheetHeight, paddingBottom: insets.bottom },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.sheetHandleArea}>
          <View style={styles.sheetHandle} />
        </View>

        {!bookingExpanded ? (
          <TouchableOpacity
            style={styles.collapsedContent}
            onPress={expandSheet}
            activeOpacity={0.9}
          >
            <View style={styles.collapsedLeft}>
              <View style={styles.collapsedIcon}>
                <MapPin size={18} color={Colors.white} />
              </View>
              <View>
                <Text style={styles.collapsedTitle}>Where are you going?</Text>
                <Text style={styles.collapsedSub}>
                  Tap to book a campus ride
                </Text>
              </View>
            </View>
            <ChevronUp size={20} color={Colors.gray} />
          </TouchableOpacity>
        ) : (
          <View style={styles.expandedContent}>
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Quick Booking</Text>
                <Text style={styles.sheetSubtitle}>SAFE CAMPUS COMMUTE</Text>
              </View>
              <TouchableOpacity
                onPress={collapseSheet}
                style={styles.closeSheetBtn}
              >
                <X size={18} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => openLocationPicker("pickup")}
            >
              <View
                style={[styles.locDot, { backgroundColor: Colors.primary }]}
              />
              <View style={styles.locInfo}>
                <Text style={styles.locLabel}>PICKUP</Text>
                <Text style={styles.locName}>
                  {pickup?.name ?? "Select pickup"}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => openLocationPicker("destination")}
            >
              <View style={[styles.locDot, { backgroundColor: Colors.red }]} />
              <View style={styles.locInfo}>
                <Text style={styles.locLabel}>DESTINATION</Text>
                <Text style={styles.locName}>
                  {destination?.name ?? "Select destination"}
                </Text>
              </View>
              {destination && (
                <TouchableOpacity
                  onPress={() => setDestination(null)}
                  style={styles.removeBtn}
                >
                  <X size={18} color={Colors.gray} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <View style={styles.passengerRow}>
              <View style={styles.passengerLeft}>
                <Text style={styles.passengerLabel}>BOOKING FOR</Text>
                <Text style={styles.passengerValue}>
                  {passengers} Person{passengers > 1 ? "s" : ""}
                </Text>
              </View>
              <View style={styles.passengerControls}>
                <TouchableOpacity
                  style={styles.pmBtn}
                  onPress={() =>
                    passengers > 1 && setPassengers(passengers - 1)
                  }
                >
                  <Minus size={16} color={Colors.dark} />
                </TouchableOpacity>
                <Text style={styles.pmCount}>{passengers}</Text>
                <TouchableOpacity
                  style={styles.pmBtn}
                  onPress={() =>
                    passengers < 4 && setPassengers(passengers + 1)
                  }
                >
                  <Plus size={16} color={Colors.dark} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.paymentRow}>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() =>
                  setPaymentMethod(
                    paymentMethod === "Wallet" ? "Cash" : "Wallet",
                  )
                }
              >
                <Text style={styles.payOptLabel}>METHOD</Text>
                <Text style={styles.payOptValue}>{paymentMethod}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={() => setShowVoucherModal(true)}
              >
                <Text style={styles.payOptLabel}>VOUCHER</Text>
                <Text
                  style={[
                    styles.payOptValue,
                    { color: selectedVoucher ? Colors.primary : Colors.gray },
                  ]}
                >
                  {selectedVoucher ? selectedVoucher.code : "Select"}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.confirmBtn,
                !destination && styles.confirmBtnDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!destination}
            >
              <Text style={styles.confirmText}>
                {destination
                  ? `CONFIRM BOOKING - ₦${finalFare}`
                  : "SELECT A DESTINATION"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>

      <Animated.View
        style={[
          styles.aiFab,
          {
            bottom: (bookingExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT) + 16,
            transform: [{ scale: fabPulse }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.aiFabInner}
          onPress={() => router.push("/support-hub" as never)}
        >
          <MessageCircle size={22} color={Colors.white} />
        </TouchableOpacity>
      </Animated.View>
      <View
        style={[
          styles.locateWrap,
          {
            bottom: (bookingExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT) + 86,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.locateBtn}
          onPress={() => {
            if (userLocation) {
              const userLat = userLocation.coords.latitude;
              const userLon = userLocation.coords.longitude;
              const nearest = nearestCampusFor(userLat, userLon);
              if (nearest) setPickup(nearest);
              setMapCenter({ latitude: userLat, longitude: userLon });
              setUserFollowsMap(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
              Alert.alert("Location", "Current location not available yet.");
            }
          }}
        >
          <Crosshair size={20} color={Colors.dark} />
        </TouchableOpacity>
      </View>

      <Modal visible={showLocationPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.pickerSheet, { paddingBottom: insets.bottom + 20 }]}
          >
            <Text style={styles.pickerTitle}>
              Select {pickingFor === "pickup" ? "Pickup" : "Destination"}
            </Text>
            <View style={styles.searchContainer}>
              <MapPin size={20} color={Colors.gray} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a location..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={Colors.gray}
              />
            </View>
            <ScrollView style={styles.pickerList}>
              {filteredLocations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.pickerItem}
                  onPress={() => selectLocation(loc)}
                >
                  <Text style={styles.pickerItemText}>{loc.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerClose}
              onPress={() => setShowLocationPicker(false)}
            >
              <Text style={styles.pickerCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showVoucherModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[styles.pickerSheet, { paddingBottom: insets.bottom + 20 }]}
          >
            <Text style={styles.pickerTitle}>Select Voucher</Text>
            <ScrollView style={styles.pickerList}>
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  setSelectedVoucher(null);
                  setShowVoucherModal(false);
                }}
              >
                <Ticket size={18} color={Colors.gray} />
                <Text style={styles.pickerItemText}>No voucher</Text>
              </TouchableOpacity>
              {MOCK_VOUCHERS.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedVoucher(v);
                    setShowVoucherModal(false);
                  }}
                >
                  <Ticket size={18} color={Colors.primary} />
                  <View style={styles.voucherInfo}>
                    <Text style={styles.pickerItemText}>{v.code}</Text>
                    <Text style={styles.voucherDesc}>{v.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.pickerClose}
              onPress={() => setShowVoucherModal(false)}
            >
              <Text style={styles.pickerCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  webMap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#E8F0E8",
    padding: 16,
    paddingTop: 120,
  },
  locateWrap: {
    position: "absolute",
    right: 16,
    zIndex: 15,
  },
  locateBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  webMapGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  webMapPin: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  webMapPinActive: { backgroundColor: Colors.primary },
  webMapPinText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark,
    maxWidth: 100,
  },
  webMapPinTextActive: { color: Colors.white },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  menuBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  safeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    elevation: 4,
  },
  safeText: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.dark,
    letterSpacing: 0.5,
  },
  topRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  notifDot: {
    position: "absolute",
    top: 11,
    right: 13,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  avatarBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    elevation: 4,
  },
  avatarImage: { width: 42, height: 42, borderRadius: 21 },
  avatarLetter: { fontSize: 18, fontWeight: "700", color: Colors.primary },
  bookingSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    zIndex: 20,
    overflow: "hidden",
  },
  sheetHandleArea: { paddingTop: 10, paddingBottom: 4, alignItems: "center" },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  collapsedContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    flex: 1,
  },
  collapsedLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  collapsedIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  collapsedTitle: { fontSize: 16, fontWeight: "700", color: Colors.dark },
  collapsedSub: { fontSize: 12, color: Colors.gray, marginTop: 2 },
  expandedContent: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 22, fontWeight: "800", color: Colors.dark },
  sheetSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: 1,
    marginTop: 2,
  },
  closeSheetBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
  },
  locDot: { width: 10, height: 10, borderRadius: 5 },
  locInfo: { flex: 1 },
  locLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.gray,
    letterSpacing: 0.5,
  },
  locName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.dark,
    marginTop: 2,
  },
  removeBtn: { padding: 5 },
  passengerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 12,
  },
  passengerLeft: { gap: 2 },
  passengerLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.gray,
    letterSpacing: 0.5,
  },
  passengerValue: { fontSize: 14, fontWeight: "700", color: Colors.dark },
  passengerControls: { flexDirection: "row", alignItems: "center", gap: 14 },
  pmBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
  },
  pmCount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark,
    minWidth: 20,
    textAlign: "center",
  },
  paymentRow: { flexDirection: "row", gap: 12, marginTop: 12 },
  paymentOption: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
  },
  payOptLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.gray,
    letterSpacing: 0.5,
  },
  payOptValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.dark,
    marginTop: 4,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  confirmBtnDisabled: { opacity: 0.5 },
  confirmText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.white,
    letterSpacing: 0.3,
  },
  aiFab: { position: "absolute", left: 16, zIndex: 15 },
  aiFabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0D3320",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: "70%",
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.dark,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
    color: Colors.dark,
  },
  pickerList: { maxHeight: 400 },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pickerItemText: { fontSize: 15, fontWeight: "600", color: Colors.dark },
  voucherInfo: { flex: 1, gap: 2 },
  voucherDesc: { fontSize: 12, color: Colors.gray },
  pickerClose: { alignItems: "center", paddingVertical: 16 },
  pickerCloseText: { fontSize: 15, color: Colors.gray, fontWeight: "600" },
});
