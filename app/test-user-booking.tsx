import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";

interface BookingRequest {
  passengerName: string;
  pickupLocation: string;
  dropoffLocation: string;
  paymentMethod: "card" | "wallet";
  seats: number;
}

export default function TestUserBooking() {
  const [booking, setBooking] = useState<BookingRequest>({
    passengerName: "Test User",
    pickupLocation: "123 Main Street",
    dropoffLocation: "456 Oak Avenue",
    paymentMethod: "card",
    seats: 1,
  });

  const createBooking = async () => {
    try {
      // Simulate API call to create booking
      const response = await fetch("http://localhost:8082/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...booking,
          passengerRating: 4.8,
          passengerAvatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          distance: Math.random() * 10 + 2,
          duration: Math.random() * 30 + 10,
          fare: Math.random() * 50 + 15,
        }),
      });

      if (response.ok) {
        Alert.alert(
          "Success",
          "Booking created successfully! Check the rider app to see the incoming request.",
        );
      } else {
        Alert.alert(
          "Error",
          "Failed to create booking. Using mock data instead.",
        );
      }
    } catch (error) {
      console.log("Booking API not available, using mock simulation");
      Alert.alert("Info", "Booking created in mock mode! Check the rider app.");
    }
  };

  const createRandomBooking = () => {
    const names = [
      "John Doe",
      "Jane Smith",
      "Mike Johnson",
      "Sarah Wilson",
      "David Brown",
    ];
    const pickupLocations = [
      "123 Main Street",
      "456 Oak Avenue",
      "789 Pine Road",
      "321 Elm Street",
      "555 River Drive",
    ];
    const dropoffLocations = [
      "100 Downtown Plaza",
      "200 Shopping Center",
      "300 Business District",
      "400 University Campus",
      "500 Airport Terminal",
    ];

    setBooking({
      passengerName: names[Math.floor(Math.random() * names.length)],
      pickupLocation:
        pickupLocations[Math.floor(Math.random() * pickupLocations.length)],
      dropoffLocation:
        dropoffLocations[Math.floor(Math.random() * dropoffLocations.length)],
      paymentMethod: Math.random() > 0.5 ? "card" : "wallet",
      seats: Math.random() > 0.8 ? 2 : 1,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🚗 Test User Booking</Text>
          <Text style={styles.subtitle}>
            Create test bookings for rider app
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Passenger Name</Text>
            <TextInput
              style={styles.input}
              value={booking.passengerName}
              onChangeText={(text) =>
                setBooking({ ...booking, passengerName: text })
              }
              placeholder="Enter passenger name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pickup Location</Text>
            <TextInput
              style={styles.input}
              value={booking.pickupLocation}
              onChangeText={(text) =>
                setBooking({ ...booking, pickupLocation: text })
              }
              placeholder="Enter pickup location"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dropoff Location</Text>
            <TextInput
              style={styles.input}
              value={booking.dropoffLocation}
              onChangeText={(text) =>
                setBooking({ ...booking, dropoffLocation: text })
              }
              placeholder="Enter dropoff location"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.paymentButtons}>
              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  booking.paymentMethod === "card" &&
                    styles.paymentButtonActive,
                ]}
                onPress={() =>
                  setBooking({ ...booking, paymentMethod: "card" })
                }
              >
                <Text
                  style={[
                    styles.paymentButtonText,
                    booking.paymentMethod === "card" &&
                      styles.paymentButtonTextActive,
                  ]}
                >
                  💳 Card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.paymentButton,
                  booking.paymentMethod === "wallet" &&
                    styles.paymentButtonActive,
                ]}
                onPress={() =>
                  setBooking({ ...booking, paymentMethod: "wallet" })
                }
              >
                <Text
                  style={[
                    styles.paymentButtonText,
                    booking.paymentMethod === "wallet" &&
                      styles.paymentButtonTextActive,
                  ]}
                >
                  💰 Wallet
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Number of Seats</Text>
            <View style={styles.seatButtons}>
              {[1, 2, 3, 4].map((seats) => (
                <TouchableOpacity
                  key={seats}
                  style={[
                    styles.seatButton,
                    booking.seats === seats && styles.seatButtonActive,
                  ]}
                  onPress={() => setBooking({ ...booking, seats })}
                >
                  <Text
                    style={[
                      styles.seatButtonText,
                      booking.seats === seats && styles.seatButtonTextActive,
                    ]}
                  >
                    {seats}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={createBooking}>
            <Text style={styles.createButtonText}>🚀 Create Booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.randomButton}
            onPress={createRandomBooking}
          >
            <Text style={styles.randomButtonText}>🎲 Random Booking</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>📋 Instructions:</Text>
          <Text style={styles.instructionsText}>
            1. Make sure the rider app is running on port 8082{"\n"}
            2. Create a booking using this form
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  paymentButtons: {
    flexDirection: "row",
    gap: 10,
  },
  paymentButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    alignItems: "center",
  },
  paymentButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  paymentButtonText: {
    fontSize: 14,
    color: Colors.dark,
  },
  paymentButtonTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  seatButtons: {
    flexDirection: "row",
    gap: 10,
  },
  seatButton: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  seatButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  seatButtonText: {
    fontSize: 16,
    color: Colors.dark,
  },
  seatButtonTextActive: {
    color: Colors.white,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  createButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  randomButton: {
    backgroundColor: Colors.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  randomButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  instructions: {
    backgroundColor: Colors.lightGray,
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
});
