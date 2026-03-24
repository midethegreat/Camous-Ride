import { generateMockRideRequest } from "@/constants/mockData";
import { RideRequest } from "@/services/riderApi";

export interface BookingNotification {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  passengerRating: number;
  pickupLocation: string;
  dropoffLocation: string;
  distance: number;
  duration: number;
  fare: number;
  paymentMethod: string;
  seats: number;
  timestamp: string;
  status: "pending" | "accepted" | "declined";
  estimatedArrival: string;
}

class RideBookingService {
  private listeners: Array<(booking: BookingNotification) => void> = [];
  private activeBookings: Map<string, BookingNotification> = new Map();
  private bookingInterval: NodeJS.Timeout | null = null;
  private frequencyMultiplier: number = 1.0;

  constructor() {
    this.startSimulatingBookings();
  }

  // Update simulation frequency based on priority
  setFrequencyMultiplier(multiplier: number) {
    this.frequencyMultiplier = multiplier;
    this.stopSimulatingBookings();
    this.startSimulatingBookings();
  }

  // Subscribe to new bookings
  subscribe(callback: (booking: BookingNotification) => void) {
    this.listeners.push(callback);

    // Send existing pending bookings to new subscriber
    this.activeBookings.forEach((booking) => {
      if (booking.status === "pending") {
        callback(booking);
      }
    });

    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Simulate live bookings from user app
  private startSimulatingBookings() {
    // Generate a booking every 10-30 seconds (multiplied by frequencyMultiplier)
    const baseInterval = 15000; // 15 seconds average
    const interval = (baseInterval / this.frequencyMultiplier);

    this.bookingInterval = setInterval(
      () => {
        const shouldCreateBooking = Math.random() > 0.3; // 70% chance

        if (shouldCreateBooking) {
          this.createRandomBooking();
        }
      },
      interval,
    );

    // Create initial booking after 2 seconds
    setTimeout(() => this.createRandomBooking(), 2000);
  }

  private createRandomBooking() {
    const mockRequest = generateMockRideRequest(`ride_${Date.now()}`);

    const booking: BookingNotification = {
      id: mockRequest.id,
      passengerName: mockRequest.passengerName,
      passengerAvatar: mockRequest.passengerAvatar,
      passengerRating: mockRequest.passengerRating,
      pickupLocation: mockRequest.pickupLocation,
      dropoffLocation: mockRequest.dropoffLocation,
      distance: mockRequest.distance,
      duration: mockRequest.duration,
      fare: mockRequest.fare,
      paymentMethod: mockRequest.paymentMethod,
      seats: mockRequest.seats,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "pending",
      estimatedArrival: new Date(
        Date.now() + mockRequest.duration * 60000,
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    this.activeBookings.set(booking.id, booking);
    this.notifyListeners(booking);
  }

  private notifyListeners(booking: BookingNotification) {
    this.listeners.forEach((callback) => {
      try {
        callback(booking);
      } catch (error) {
        console.error("Error notifying booking listener:", error);
      }
    });
  }

  // Accept a booking
  acceptBooking(bookingId: string): boolean {
    const booking = this.activeBookings.get(bookingId);
    if (booking && booking.status === "pending") {
      booking.status = "accepted";
      this.activeBookings.set(bookingId, booking);
      return true;
    }
    return false;
  }

  // Decline a booking
  declineBooking(bookingId: string): boolean {
    const booking = this.activeBookings.get(bookingId);
    if (booking && booking.status === "pending") {
      booking.status = "declined";
      this.activeBookings.set(bookingId, booking);
      return true;
    }
    return false;
  }

  // Get active bookings
  getActiveBookings(): BookingNotification[] {
    return Array.from(this.activeBookings.values()).filter(
      (b) => b.status === "pending",
    );
  }

  // Get booking by ID
  getBooking(bookingId: string): BookingNotification | undefined {
    return this.activeBookings.get(bookingId);
  }

  // Stop the simulation
  stopSimulatingBookings() {
    if (this.bookingInterval) {
      clearInterval(this.bookingInterval);
      this.bookingInterval = null;
    }
  }

  // Create a booking manually (for testing)
  createBooking(
    booking: Omit<
      BookingNotification,
      "id" | "timestamp" | "status" | "estimatedArrival"
    >,
  ): BookingNotification {
    const newBooking: BookingNotification = {
      ...booking,
      id: `manual_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "pending",
      estimatedArrival: new Date(
        Date.now() + booking.duration * 60000,
      ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    this.activeBookings.set(newBooking.id, newBooking);
    this.notifyListeners(newBooking);
    return newBooking;
  }
}

export const rideBookingService = new RideBookingService();
