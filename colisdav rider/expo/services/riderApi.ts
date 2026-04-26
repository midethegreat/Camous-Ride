import { RIDER_API_URL, USER_API_URL } from "@/constants/api";
import {
  mockDriverProfile,
  mockDriverStats,
  mockTrips,
  mockRideRequests,
  mockNotifications,
  mockWalletData,
  generateMockTrip,
  generateMockRideRequest,
} from "@/constants/mockData";

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  totalTrips: number;
  memberSince: string;
  status: string;
  university: string;
  matricNumber: string;
  department: string;
  level: string;
  vehicle: {
    type: string;
    plateNumber: string;
    color: string;
    capacity: number;
    model: string;
    year: string;
  };
}

export interface DriverStats {
  earnings: number;
  trips: number;
  onlineHours: number;
  acceptanceRate: number;
  rating: number;
}

export interface RideRequest {
  id: string;
  passengerName: string;
  passengerAvatar: string;
  passengerRating: number;
  pickupLocation: string;
  dropoffLocation: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffLat?: number;
  dropoffLng?: number;
  distance: number;
  duration: number;
  fare: number;
  paymentMethod: string;
  seats: number;
  timestamp: string;
  status: string;
}

export interface TripHistory {
  id: string;
  date: string;
  passengerName: string;
  pickup: string;
  dropoff: string;
  fare: number;
  status: string;
  paymentMethod: string;
  rating: number | null;
}

export interface WalletData {
  balance: number;
  pendingPayout: number;
  totalEarned: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: number;
  type: string;
  description: string;
  amount: number;
  date: string;
}

class RiderApiService {
  private baseUrl = RIDER_API_URL;
  private useMockData = true; // Using mock data for now until backend is ready
  private mockDriverId = "1"; // Using numeric ID from database

  private async fetchWithAuth(endpoint: string, options?: RequestInit) {
    const token = await this.getAuthToken();

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async getAuthToken(): Promise<string | null> {
    // This will be implemented based on your auth storage mechanism
    // For now, return null - you can implement secure token storage later
    return null;
  }

  // Driver Profile
  async getDriverProfile(driverId: string): Promise<DriverProfile> {
    if (this.useMockData) {
      // Return mock data for development
      return mockDriverProfile;
    }

    const data = await this.fetchWithAuth(`/api/drivers/${driverId}/profile`);
    return data.data;
  }

  // Driver Stats
  async getDriverStats(
    driverId: string,
    period: "today" | "week" | "month" = "today",
  ): Promise<DriverStats> {
    if (this.useMockData) {
      // Return mock data for development
      return mockDriverStats;
    }

    const data = await this.fetchWithAuth(
      `/api/drivers/${driverId}/stats?period=${period}`,
    );
    return data.data;
  }

  // Ride Requests
  async getRideRequests(
    driverId: string,
    status: "pending" | "accepted" = "pending",
  ): Promise<RideRequest[]> {
    if (this.useMockData) {
      // Return mock data for development
      return mockRideRequests;
    }

    const data = await this.fetchWithAuth(
      `/api/drivers/${driverId}/ride-requests?status=${status}`,
    );
    return data.data;
  }

  // Accept Ride
  async acceptRide(driverId: string, rideId: string): Promise<any> {
    const data = await this.fetchWithAuth(
      `/api/drivers/${driverId}/accept-ride`,
      {
        method: "POST",
        body: JSON.stringify({ rideId }),
      },
    );
    return data;
  }

  // Update Driver Status
  async updateDriverStatus(driverId: string, status: string): Promise<any> {
    const data = await this.fetchWithAuth(`/api/drivers/${driverId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    return data;
  }

  // Update Driver Location
  async updateDriverLocation(
    driverId: string,
    lat: number,
    lng: number,
    location: string,
  ): Promise<any> {
    const data = await this.fetchWithAuth(`/api/drivers/${driverId}/location`, {
      method: "PUT",
      body: JSON.stringify({ lat, lng, location }),
    });
    return data;
  }

  // Driver Earnings
  async getDriverEarnings(
    driverId: string,
    period: "week" | "month" | "year" = "week",
  ): Promise<any> {
    const data = await this.fetchWithAuth(
      `/api/drivers/${driverId}/earnings?period=${period}`,
    );
    return data.data;
  }

  // Driver Wallet
  async getDriverWallet(driverId: string): Promise<any> {
    if (this.useMockData) {
      // Return mock data for development
      return mockWalletData;
    }

    const data = await this.fetchWithAuth(`/api/drivers/${driverId}/wallet`);
    return data.data;
  }

  // Driver Trips
  async getDriverTrips(driverId: string, limit: number = 20): Promise<any> {
    if (this.useMockData) {
      // Return mock data for development
      return mockTrips;
    }

    const data = await this.fetchWithAuth(
      `/api/drivers/${driverId}/trips?limit=${limit}`,
    );
    return data.data;
  }

  // Driver Notifications
  async getDriverNotifications(driverId: string): Promise<any> {
    if (this.useMockData) {
      // Return mock data for development
      return mockNotifications;
    }

    const data = await this.fetchWithAuth(
      `/api/drivers/${driverId}/notifications`,
    );
    return data.data;
  }
}

export const riderApiService = new RiderApiService();
