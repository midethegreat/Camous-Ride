import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { User } from "@/types";
import { API_URL } from "@/constants/apiConfig";
import { STUDENT_DATABASE, MOCK_USER } from "@/_mocks/data";

// Expo Router will ignore this file
// @expo-router/ignore

const AUTH_KEY = "cid_auth";
const USER_KEY = "cid_user";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const [authStr, userStr] = await Promise.all([
        AsyncStorage.getItem(AUTH_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (authStr === "true" && userStr) {
        const loadedUser = JSON.parse(userStr);
        console.log("Loaded user from storage:", loadedUser);
        if (loadedUser) {
          setUser(loadedUser);
          setIsAuthenticated(true);
        }
      }
    } catch (e) {
      console.log("Error loading auth state:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const register = useCallback(
    async (
      matricNumber: string,
      pin: string,
      idCardImage: string | null,
      email: string,
      fullName: string,
      department: string,
      level: string,
      phoneNumber: string,
    ) => {
      console.log("Registering user via backend:", {
        matricNumber,
        email,
      });

      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber,
          pin,
          idCardImage,
          email,
          fullName,
          department,
          level,
          phoneNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return { email: data.user?.email || email, hint: data.hint };
    },
    [],
  );

  const login = useCallback(async (matricNumber: string, pin: string) => {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matricNumber, pin }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    const loggedInUser: User = data.user;

    await AsyncStorage.setItem(AUTH_KEY, "true");
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (user?.email) {
        await fetch(`${API_URL}/api/users/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });
      }
    } catch (error) {
      console.error("Failed to log out on server:", error);
    } finally {
      await AsyncStorage.multiRemove([AUTH_KEY, USER_KEY, "cid_guest_auth"]);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [user]);

  const updateUser = useCallback(
    async (updates: Partial<User>) => {
      if (!user) return;
      const updated = { ...user, ...updates };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updated));
      setUser(updated);
    },
    [user],
  );

  const updatePin = useCallback(
    async (oldPin: string, newPin: string) => {
      if (!user) throw new Error("Not authenticated");
      if (user.pin !== oldPin) throw new Error("Current PIN is incorrect");
      await updateUser({ pin: newPin });
    },
    [user, updateUser],
  );

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
    } finally {
      await AsyncStorage.multiRemove([AUTH_KEY, USER_KEY, "cid_guest_auth"]);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [user]);

  const setPin = useCallback(async (email: string, pin: string) => {
    const response = await fetch(`${API_URL}/api/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, pin }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to set PIN");
    console.log(`PIN set for ${email}`);
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const response = await fetch(`${API_URL}/api/users/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Invalid OTP");
    console.log(`OTP verified for ${email}`);
    return;
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    const response = await fetch(`${API_URL}/api/users/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to resend OTP");
    console.log(`OTP resent to ${email}`);
  }, []);

  const toggle2FA = useCallback(
    async (enabled: boolean, method?: "email" | "phone") => {
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(`${API_URL}/api/2fa/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, enabled, method }),
      });

      // Check if response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error("Server error - please try again later");
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update 2FA status");
      }

      await updateUser({
        isTwoFactorEnabled: enabled,
        twoFactorMethod: enabled ? method : undefined,
      });
    },
    [user, updateUser],
  );

  const refreshUser = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_URL}/api/users/${user.id}/balance`);
      if (response.ok) {
        const data = await response.json();
        // Assuming the balance endpoint or a new profile endpoint returns the full user object
        // For now, let's just update what we get
        const updatedUser = {
          ...user,
          ...data.user,
          walletBalance: data.balance,
        };
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Failed to refresh user data", e);
    }
  }, [user]);

  return {
    isAuthenticated,
    isLoading,
    user,
    register,
    login,
    logout,
    updateUser,
    updatePin,
    deleteAccount,
    verifyOtp,
    resendOtp,
    setPin,
    toggle2FA,
    refreshUser,
  };
});
