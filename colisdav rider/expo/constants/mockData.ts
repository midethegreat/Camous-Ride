// Comprehensive Mock Data Service for COLISDAV Rider App
export const mockDriverProfile = {
  id: 1,
  fullName: "John Smith",
  email: "john.smith@colisdav.com",
  phone: "+1 (555) 123-4567",
  avatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  rating: 4.8,
  totalRides: 1247,
  joinedDate: "2023-01-15",
  isVerified: true,
  status: "online",
  vehicle: {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    color: "Silver",
    plateNumber: "ABC-1234",
    type: "sedan",
    maxPassengers: 4,
  },
  documents: {
    license: { status: "verified", expiryDate: "2025-12-31" },
    insurance: { status: "verified", expiryDate: "2025-06-30" },
    vehicleRegistration: { status: "verified", expiryDate: "2025-03-15" },
  },
  bankDetails: {
    accountNumber: "****1234",
    bankName: "First National Bank",
    accountType: "checking",
  },
};

export const mockDriverStats = {
  totalEarnings: 24580.5,
  todayEarnings: 156.75,
  thisWeekEarnings: 892.3,
  thisMonthEarnings: 3245.8,
  totalRides: 1247,
  completedRides: 1189,
  cancelledRides: 58,
  averageRating: 4.8,
  acceptanceRate: 94.5,
  completionRate: 95.3,
  onlineHours: {
    today: 8.5,
    thisWeek: 42.3,
    thisMonth: 168.7,
  },
  distanceDriven: {
    today: 125.4,
    thisWeek: 623.8,
    thisMonth: 2487.2,
  },
};

export const mockTrips = [
  {
    id: "ride_001",
    passengerName: "Sarah Johnson",
    passengerAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=50&h=50&fit=crop&crop=face",
    passengerRating: 4.9,
    pickupLocation: "123 Main St, Downtown",
    dropoffLocation: "456 Oak Ave, Midtown",
    distance: 5.2,
    duration: 18,
    fare: 250,
    paymentMethod: "card",
    status: "completed",
    timestamp: "2024-03-18T14:30:00Z",
    rating: 5.0,
    tip: 3.5,
  },
  {
    id: "ride_002",
    passengerName: "Mike Chen",
    passengerAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
    passengerRating: 4.7,
    pickupLocation: "789 Pine St, Uptown",
    dropoffLocation: "321 Elm St, Downtown",
    distance: 3.8,
    duration: 12,
    fare: 250,
    paymentMethod: "wallet",
    status: "completed",
    timestamp: "2024-03-18T13:45:00Z",
    rating: 4.0,
    tip: 0,
  },
  {
    id: "ride_003",
    passengerName: "Emily Davis",
    passengerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
    passengerRating: 4.8,
    pickupLocation: "555 River Rd, Westside",
    dropoffLocation: "777 Hill St, Eastside",
    distance: 8.1,
    duration: 25,
    fare: 250,
    paymentMethod: "card",
    status: "in-progress",
    timestamp: "2024-03-18T15:15:00Z",
  },
];

export const mockRideRequests = [
  {
    id: "request_001",
    passengerName: "Alex Rodriguez",
    passengerAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
    passengerRating: 4.6,
    pickupLocation: "888 Market St, Central",
    dropoffLocation: "222 Park Ave, North",
    distance: 4.3,
    duration: 15,
    fare: 250,
    paymentMethod: "card",
    seats: 1,
    timestamp: "2024-03-18T15:25:00Z",
    status: "pending",
    estimatedArrival: "15:40",
  },
  {
    id: "request_002",
    passengerName: "Lisa Wang",
    passengerAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=50&h=50&fit=crop&crop=face",
    passengerRating: 4.9,
    pickupLocation: "333 Beach Blvd, Coastal",
    dropoffLocation: "666 Mall Dr, Shopping Center",
    distance: 6.7,
    duration: 22,
    fare: 250,
    paymentMethod: "wallet",
    seats: 2,
    timestamp: "2024-03-18T15:28:00Z",
    status: "pending",
    estimatedArrival: "15:50",
  },
];

export const mockNotifications = [
  {
    id: "notif_001",
    type: "ride_request",
    title: "New Ride Request",
    message: "Alex Rodriguez requested a ride from Market St to Park Ave",
    timestamp: "2024-03-18T15:25:00Z",
    isRead: false,
    data: {
      rideRequestId: "request_001",
      fare: 250,
      distance: 4.3,
    },
  },
  {
    id: "notif_002",
    type: "payment_received",
    title: "Payment Received",
    message: "₦250 received from Sarah Johnson for completed ride",
    timestamp: "2024-03-18T14:48:00Z",
    isRead: true,
    data: {
      amount: 250,
      rideId: "ride_001",
      passengerName: "Sarah Johnson",
    },
  },
  {
    id: "notif_003",
    type: "rating",
    title: "New Rating",
    message: "Mike Chen rated you 4 stars",
    timestamp: "2024-03-18T13:57:00Z",
    isRead: true,
    data: {
      rating: 4.0,
      rideId: "ride_002",
      passengerName: "Mike Chen",
    },
  },
  {
    id: "notif_004",
    type: "system",
    title: "Weekly Summary",
    message: "You completed 45 rides this week and earned ₦11,250",
    timestamp: "2024-03-17T23:59:00Z",
    isRead: true,
  },
];

export const mockWalletData = {
  balance: 1250.75,
  currency: "NGN",
  lastUpdated: "2024-03-18T15:00:00Z",
  transactions: [
    {
      id: "tx_001",
      type: "credit",
      amount: 250,
      description: "Ride payment from Sarah Johnson",
      timestamp: "2024-03-18T14:48:00Z",
      status: "completed",
    },
    {
      id: "tx_002",
      type: "debit",
      amount: -15.0,
      description: "Fuel expense",
      timestamp: "2024-03-18T12:30:00Z",
      status: "completed",
    },
    {
      id: "tx_003",
      type: "credit",
      amount: 250,
      description: "Ride payment from Mike Chen",
      timestamp: "2024-03-18T13:57:00Z",
      status: "completed",
    },
  ],
};

// Helper functions for mock data
export const generateMockTrip = (id: string) => ({
  id,
  passengerName: "New Passenger",
  passengerAvatar:
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face",
  passengerRating: 4.5,
  pickupLocation: "New Pickup Location",
  dropoffLocation: "New Dropoff Location",
  distance: Math.random() * 10 + 1,
  duration: Math.random() * 30 + 5,
  fare: 250,
  paymentMethod: Math.random() > 0.5 ? "card" : "wallet",
  status: "completed",
  timestamp: new Date().toISOString(),
  rating: Math.random() * 2 + 3,
  tip: Math.random() > 0.7 ? Math.random() * 5 : 0,
});

export const generateMockRideRequest = (id: string) => ({
  id,
  passengerName: "New Request Passenger",
  passengerAvatar:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face",
  passengerRating: 4.5,
  pickupLocation: "New Pickup Location",
  dropoffLocation: "New Dropoff Location",
  distance: Math.random() * 10 + 1,
  duration: Math.random() * 30 + 5,
  fare: 250,
  paymentMethod: Math.random() > 0.5 ? "card" : "wallet",
  seats: 1,
  timestamp: new Date().toISOString(),
  status: "pending",
  estimatedArrival: "15:40",
});
