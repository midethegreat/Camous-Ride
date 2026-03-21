// Mock data for driver interfaces

export const driverProfile = {
  id: "DRV-2024-001",
  name: "Funmi Peters",
  email: "funmi.peters@student.funaab.edu.ng",
  phone: "+234 803 456 7890",
  avatar:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  rating: 4.8,
  totalTrips: 342,
  memberSince: "Jan 2024",
  status: "verified" as const,
  university: "Federal University of Agriculture, Abeokuta",
  matricNumber: "2020/001234",
  department: "Computer Science",
  level: "400L",
};

export const vehicleInfo = {
  type: "Tricycle (Keke)",
  plateNumber: "LA 909-BC",
  color: "Green",
  capacity: 4,
  year: "2022",
  model: "TVS King",
  verificationStatus: "verified" as const,
  documents: {
    driversLicense: { status: "verified" as const, expiryDate: "2026-12-15" },
    vehicleRegistration: {
      status: "verified" as const,
      expiryDate: "2025-06-20",
    },
    insurance: { status: "pending" as const, expiryDate: null },
    hackneyPermit: { status: "verified" as const, expiryDate: "2025-03-10" },
  },
};

export const todayStats = {
  earnings: 8500,
  trips: 12,
  onlineHours: 5.5,
  acceptanceRate: 92,
  rating: 4.9,
};

export const weeklyEarnings = [
  { day: "Mon", amount: 5200 },
  { day: "Tue", amount: 7800 },
  { day: "Wed", amount: 6500 },
  { day: "Thu", amount: 9200 },
  { day: "Fri", amount: 8500 },
  { day: "Sat", amount: 10500 },
  { day: "Sun", amount: 4300 },
];

export const rideRequests = [
  {
    id: "REQ-001",
    passengerName: "Wale Adekunle",
    passengerAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    passengerRating: 4.7,
    pickupLocation: "Senate Building, FUNAAB",
    dropoffLocation: "Ceremonial Gate",
    distance: 1.2,
    duration: 4,
    fare: 200,
    paymentMethod: "Wallet",
    seats: 1,
    timestamp: "Just now",
  },
  {
    id: "REQ-002",
    passengerName: "Amaka Johnson",
    passengerAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    passengerRating: 4.9,
    pickupLocation: "Jaja Hall",
    dropoffLocation: "Library Junction",
    distance: 0.8,
    duration: 3,
    fare: 150,
    paymentMethod: "Cash",
    seats: 2,
    timestamp: "2 min ago",
  },
];

export const tripHistory = [
  {
    id: "TRIP-001",
    date: "2024-03-15T09:30:00",
    passengerName: "Wale Adekunle",
    pickup: "Senate Building",
    dropoff: "Ceremonial Gate",
    fare: 200,
    status: "completed" as const,
    paymentMethod: "Wallet",
    rating: 5,
  },
  {
    id: "TRIP-002",
    date: "2024-03-15T08:45:00",
    passengerName: "Chioma Eze",
    pickup: "School Clinic",
    dropoff: "Motion Ground",
    fare: 400,
    status: "completed" as const,
    paymentMethod: "Cash",
    rating: 4,
  },
  {
    id: "TRIP-003",
    date: "2024-03-14T17:20:00",
    passengerName: "Emmanuel Ojo",
    pickup: "Library Junction",
    dropoff: "Jaja Hall",
    fare: 150,
    status: "cancelled" as const,
    paymentMethod: "Wallet",
    rating: null,
  },
  {
    id: "TRIP-004",
    date: "2024-03-14T14:10:00",
    passengerName: "Aisha Mohammed",
    pickup: "College of Agric",
    dropoff: "Senate Building",
    fare: 250,
    status: "completed" as const,
    paymentMethod: "Wallet",
    rating: 5,
  },
];

export const walletData = {
  balance: 45200,
  pendingPayout: 8500,
  totalEarned: 156800,
  transactions: [
    {
      id: 1,
      type: "trip_income",
      description: "Ride to Senate Bldg",
      amount: 200,
      date: "2024-03-15T09:30:00",
    },
    {
      id: 2,
      type: "trip_income",
      description: "Ride to Motion Ground",
      amount: 400,
      date: "2024-03-15T08:45:00",
    },
    {
      id: 3,
      type: "payout",
      description: "Bank Transfer",
      amount: -20000,
      date: "2024-03-14T18:00:00",
    },
    {
      id: 4,
      type: "trip_income",
      description: "Ride to Library",
      amount: 150,
      date: "2024-03-14T16:20:00",
    },
    {
      id: 5,
      type: "trip_income",
      description: "Ride to Ceremonial Gate",
      amount: 300,
      date: "2024-03-14T12:10:00",
    },
    {
      id: 6,
      type: "bonus",
      description: "Weekly Bonus",
      amount: 2000,
      date: "2024-03-13T00:00:00",
    },
  ],
};

export const notifications = [
  {
    id: 1,
    title: "New Ride Request",
    message: "You have a new ride request near Senate Building",
    time: "2 min ago",
    type: "request",
  },
  {
    id: 2,
    title: "Weekly Bonus Earned!",
    message: "Congratulations! You earned ₦2,000 weekly bonus",
    time: "1 hour ago",
    type: "bonus",
  },
  {
    id: 3,
    title: "Document Expiring",
    message: "Your insurance document expires in 7 days",
    time: "3 hours ago",
    type: "alert",
  },
  {
    id: 4,
    title: "Payout Processed",
    message: "₦20,000 has been transferred to your bank account",
    time: "Yesterday",
    type: "payment",
  },
];
