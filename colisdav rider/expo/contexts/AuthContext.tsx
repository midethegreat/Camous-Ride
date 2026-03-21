import React, { createContext, useContext, useState, useEffect } from "react";
import { router } from "expo-router";
import { emailAuthService } from "@/services/emailAuth";
import { RIDER_API_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar?: string;
  rating: number;
  totalTrips: number;
  memberSince: string;
  status: string; // 'pending', 'verified', 'suspended'
  kycStatus: "pending" | "submitted" | "verified" | "rejected";
  vehicle?: {
    type: string;
    plateNumber: string;
    color: string;
    capacity: number;
    year: string;
    model: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (
    userData: Omit<
      User,
      "id" | "rating" | "totalTrips" | "memberSince" | "status" | "kycStatus"
    > & { password?: string },
  ) => Promise<boolean>;
  sendOtp: (email: string) => Promise<boolean>;
  verifyEmail: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data - in real app, this would come from your backend
  const mockUsers = [
    {
      id: "1",
      fullName: "John Doe",
      email: "john@example.com",
      phone: "08012345678",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
      rating: 4.8,
      totalTrips: 342,
      memberSince: "Jan 2024",
      status: "verified",
      kycStatus: "verified",
      vehicle: {
        type: "Tricycle (Keke)",
        plateNumber: "LA 909-BC",
        color: "Green",
        capacity: 4,
        year: "2022",
        model: "TVS King",
      },
    },
  ];

  useEffect(() => {
    // Check if user is already logged in (from local storage)
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is already logged in (from local storage)
      const storedUser = await AsyncStorage.getItem("rider_user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 1. Authenticate with backend directly
      const response = await fetch(`${RIDER_API_URL}/api/riders/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Please check your credentials.",
        );
      }

      // 2. Construct user object from backend response
      const loggedUser: User = {
        id: data.user?.id || Date.now().toString(),
        fullName: data.user?.fullName || "Rider",
        email: data.user?.email || email,
        phone: data.user?.phoneNumber || "",
        rating: data.user?.rating || 4.5,
        totalTrips: data.user?.totalTrips || 0,
        memberSince: data.user?.createdAt
          ? new Date(data.user.createdAt).toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            })
          : "Jan 2024",
        status: data.user?.status || "verified",
        kycStatus: data.user?.kycStatus || "pending",
      };

      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem("rider_user", JSON.stringify(loggedUser));
      setUser(loggedUser);
      return true;
    } catch (error: any) {
      console.error("Login error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    userData: Omit<
      User,
      "id" | "rating" | "totalTrips" | "memberSince" | "status" | "kycStatus"
    > & { password?: string },
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // 1. Check if account exists (simplified for now, backend will handle it)
      // 2. Register on backend
      const response = await fetch(`${RIDER_API_URL}/api/riders/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: userData.fullName,
          email: userData.email,
          phoneNumber: userData.phone,
          password: userData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend registration failed:", data.message);
        throw new Error(data.message || "Registration failed");
      }

      // 3. Construct user object
      const newUser: User = {
        id: data.user?.id || Date.now().toString(),
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone,
        rating: 0,
        totalTrips: 0,
        memberSince: new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        status: "verified",
        kycStatus: "pending",
      };

      // Store in AsyncStorage for persistence
      await AsyncStorage.setItem("rider_user", JSON.stringify(newUser));
      setUser(newUser);

      return true;
    } catch (error: any) {
      console.error("Signup error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("rider_user");
      setUser(null);
      router.replace("/welcome");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const sendOtp = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${RIDER_API_URL}/api/riders/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send OTP");
      }

      return true;
    } catch (error: any) {
      console.error("Send OTP error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await fetch(`${RIDER_API_URL}/api/riders/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Verification failed");
      }

      return true;
    } catch (error: any) {
      console.error("Verification error:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);

        // In a real app, you would also update your backend/database here
        console.log("Profile updated:", updatedUser);
      }
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    sendOtp,
    verifyEmail,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
