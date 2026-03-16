import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { User } from "@/_types";
import { STUDENT_DATABASE } from "@/_mocks/data";
import { API_URL } from "@/_constants/apiConfig";

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
    ) => {
      console.log("Register function called with:", {
        matricNumber,
        pin,
        idCardImage,
        email,
      });

      const record = STUDENT_DATABASE[matricNumber];
      console.log("Student record found:", record);

      if (!record) {
        throw new Error("Matric number not found in mock database");
      }

      // Double-check that record has all required properties
      if (
        !record.fullName ||
        !record.department ||
        !record.level ||
        !record.phoneNumber
      ) {
        throw new Error("Incomplete student record in database");
      }

      const requestBody = {
        matricNumber,
        pin,
        idCardImage,
        email,
        fullName: record.fullName,
        department: record.department,
        level: record.level,
        phoneNumber: record.phoneNumber,
      };

      console.log("Sending request with body:", requestBody);

      const response = await fetch(`${API_URL}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      // Check if response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Server returned non-JSON response:", text);
        throw new Error("Server error - please try again later");
      }

      let data;
      try {
        data = await response.json();
        console.log("Registration response data:", data);
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        const text = await response.text();
        console.error("Response text:", text);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        console.error(
          "Registration failed with status:",
          response.status,
          "data:",
          data,
        );
        throw new Error(data.message || "Failed to register");
      }

      // The server returns a verification hint, not user data
      // Return the email that was passed in since the registration was successful
      console.log("Registration successful, verification hint:", data.hint);
      return { email: email };
    },
    [],
  );

  const login = useCallback(async (matricNumber: string, pin: string) => {
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ matricNumber, pin }),
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
      throw new Error(data.message || "Login failed");
    }

    const { user: loggedInUser } = data;
    const record = STUDENT_DATABASE[matricNumber];

    // --- LOGGING START ---
    console.log("Data from server (loggedInUser):", loggedInUser);
    console.log("Data from mock DB (record):", record);
    // --- LOGGING END ---

    const userWithPin: User = {
      ...loggedInUser,
      fullName: loggedInUser.fullName || record?.fullName,
      phoneNumber: loggedInUser.phoneNumber || record?.phoneNumber,
      walletBalance: loggedInUser.walletBalance ?? 0,
      pin,
      idCardImage: loggedInUser.idCardImage || null,
      bloodGroup: loggedInUser.bloodGroup || "Not set",
      bio: loggedInUser.bio || "Campus commuting, safer and faster.",
      profileImage: loggedInUser.profileImage || null,
    };

    console.log("Final user object being saved:", userWithPin);

    await AsyncStorage.setItem(AUTH_KEY, "true");
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(userWithPin));
    setUser(userWithPin);
    setIsAuthenticated(true);
    return userWithPin;
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
      console.log("Updating user state:", updated);
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
      const response = await fetch(`${API_URL}/api/users/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
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
        throw new Error(data.message || "Failed to delete account on server");
      }
    } finally {
      await AsyncStorage.multiRemove([AUTH_KEY, USER_KEY, "cid_guest_auth"]);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [user]);

  const setPin = useCallback(async (email: string, pin: string) => {
    const response = await fetch(`${API_URL}/api/users/set-pin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, pin }),
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
      throw new Error(data.message || "Failed to set PIN");
    }
  }, []);

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    const response = await fetch(`${API_URL}/api/users/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
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
      throw new Error(data.message || "OTP verification failed");
    }

    // Do not log the user in here. Just confirm verification was successful.
    // The user will be logged in after setting their PIN.
    return;
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    const response = await fetch(`${API_URL}/api/users/resend-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // Check if response is JSON before trying to parse
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Non-JSON response from server:", text);
      throw new Error("Server returned invalid response format");
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to resend OTP");
    }
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
        const updatedUser = { ...user, ...data.user, walletBalance: data.balance };
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
