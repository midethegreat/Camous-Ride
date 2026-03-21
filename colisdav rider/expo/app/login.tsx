import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Phone,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useAuth } from "@/contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrPhone || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // Use auth context to login with email/phone and password (OTP removed for login)
      const loginSuccess = await login(emailOrPhone, password);
      if (loginSuccess) {
        Alert.alert("Success", "Login successful!");
        router.replace("/(tabs)");
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
            >
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>C</Text>
              </View>
              <Text style={styles.headerTitle}>Colisdav Rider</Text>
            </View>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Login to your account to continue driving.
            </Text>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Mail
                  color="rgba(255,255,255,0.6)"
                  size={20}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={emailOrPhone}
                  onChangeText={setEmailOrPhone}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputContainer}>
                <Lock
                  color="rgba(255,255,255,0.6)"
                  size={20}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="rgba(255,255,255,0.6)" />
                  ) : (
                    <Eye size={20} color="rgba(255,255,255,0.6)" />
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() =>
                  Alert.alert("Reset Password", "Functionality coming soon.")
                }
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupLinkContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/onboarding")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    paddingHorizontal: width * 0.08,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 60,
  },
  backBtn: {
    marginRight: 15,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 22,
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  eyeBtn: {
    padding: 4,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: 5,
  },
  forgotText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.8,
  },
  button: {
    backgroundColor: "white",
    height: 60,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "700",
  },
  signupLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  signupText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
  },
  signupLink: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
});
