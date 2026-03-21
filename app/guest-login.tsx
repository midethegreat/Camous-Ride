import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/Colors";
import { API_URL } from "@/constants/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function GuestLogin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing info", "Enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      // Mock guest login
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (email === "test@test.com" && password === "password") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await AsyncStorage.setItem("cid_guest_auth", "true");
        const nextProfile = {
          fullName: "Guest User",
          email: email,
          bio: "Just a guest",
          phoneNumber: "+234 000 000 0000",
          gender: "Male",
          employmentStatus: "Guest",
        };
        await AsyncStorage.setItem(
          "cid_guest_profile",
          JSON.stringify(nextProfile),
        );
        router.replace("/" as never);
      } else {
        throw new Error("Invalid guest credentials (MOCK: test@test.com / password)");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingHorizontal: 20 },
      ]}
    >
      <Text style={styles.title}>Guest Login</Text>
      <Text style={styles.label}>EMAIL</Text>
      <TextInput
        style={styles.input}
        placeholder="you@example.com"
        placeholderTextColor={Colors.lightGray}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.label}>PASSWORD</Text>
      <TextInput
        style={styles.input}
        placeholder="Your password"
        placeholderTextColor={Colors.lightGray}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>
          {loading ? "Signing in..." : "Sign In"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{ alignItems: "center", paddingVertical: 10 }}
        onPress={() => router.push("/support-hub" as never)}
        activeOpacity={0.75}
      >
        <Text
          style={{
            color: Colors.gray,
            textDecorationLine: "underline",
            fontWeight: "700" as const,
          }}
        >
          Forgot password?
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  title: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.dark,
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.gray,
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 14,
    color: Colors.dark,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "800" as const },
});
