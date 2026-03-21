import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/color";
import {
  rideBookingService,
  BookingNotification,
} from "@/services/rideBookingService";

export default function TestBookingSimulator() {
  const [bookings, setBookings] = useState<BookingNotification[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isActive) {
      const unsubscribe = rideBookingService.subscribe((booking) => {
        setBookings((prev) => {
          const existingIndex = prev.findIndex((b) => b.id === booking.id);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = booking;
            return updated;
          } else {
            return [...prev, booking];
          }
        });
      });

      // Get existing bookings
      const existingBookings = rideBookingService.getActiveBookings();
      setBookings(existingBookings);

      return () => unsubscribe();
    } else {
      setBookings([]);
    }
  }, [isActive]);

  const toggleSimulator = () => {
    setIsActive(!isActive);
  };

  const createManualBooking = () => {
    rideBookingService.createRandomBooking();
  };

  const acceptBooking = (bookingId: string) => {
    rideBookingService.acceptBooking(bookingId);
  };

  const declineBooking = (bookingId: string) => {
    rideBookingService.declineBooking(bookingId);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚗 Live Booking Simulator</Text>
        <Text style={styles.subtitle}>Test the real-time booking system</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.button,
            isActive ? styles.buttonActive : styles.buttonInactive,
          ]}
          onPress={toggleSimulator}
        >
          <Text style={styles.buttonText}>
            {isActive ? "🛑 Stop Simulator" : "▶️ Start Simulator"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonManual]}
          onPress={createManualBooking}
          disabled={!isActive}
        >
          <Text style={styles.buttonText}>➕ Create Manual Booking</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bookingsContainer}>
        <Text style={styles.bookingsTitle}>
          📋 Active Bookings ({bookings.length})
        </Text>

        {bookings.length === 0 ? (
          <Text style={styles.noBookingsText}>
            {isActive
              ? "No active bookings. Simulator is running and will create bookings automatically."
              : "Start the simulator to see live bookings."}
          </Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingId}>#{booking.id}</Text>
                <Text
                  style={[
                    styles.bookingStatus,
                    {
                      color:
                        booking.status === "pending"
                          ? Colors.warning
                          : Colors.success,
                    },
                  ]}
                >
                  {booking.status.toUpperCase()}
                </Text>
              </View>

              <View style={styles.bookingDetails}>
                <Text style={styles.passengerName}>
                  👤 {booking.passengerName}
                </Text>
                <Text style={styles.location}>📍 {booking.pickupLocation}</Text>
                <Text style={styles.location}>
                  🏁 {booking.dropoffLocation}
                </Text>
                <Text style={styles.fare}>
                  💰 ₦{booking.fare.toLocaleString()}
                </Text>
                <Text style={styles.distance}>📏 {booking.distance} km</Text>
                <Text style={styles.time}>
                  ⏰ {formatTime(booking.timestamp)}
                </Text>
              </View>

              {booking.status === "pending" && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => acceptBooking(booking.id)}
                  >
                    <Text style={styles.actionButtonText}>✅ Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.declineButton]}
                    onPress={() => declineBooking(booking.id)}
                  >
                    <Text style={styles.actionButtonText}>❌ Decline</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 5,
  },
  buttonActive: {
    backgroundColor: Colors.error,
  },
  buttonInactive: {
    backgroundColor: Colors.primary,
  },
  buttonManual: {
    backgroundColor: Colors.warning,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  bookingsContainer: {
    marginTop: 20,
  },
  bookingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  noBookingsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
    padding: 20,
  },
  bookingCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  bookingStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
  bookingDetails: {
    marginBottom: 12,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  fare: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.success,
    marginTop: 8,
  },
  distance: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: Colors.success,
  },
  declineButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});
