import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { emailAuthService } from "@/services/emailAuth";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();
  const { signup, sendOtp, verifyEmail } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    otherName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleSendOtp = async () => {
    if (!formData.email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const success = await sendOtp(formData.email);
      if (success) {
        setShowOtpField(true);
        Alert.alert("Success", "Verification code sent to your email!");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      Alert.alert("Error", "Please enter a valid 6-digit code");
      return;
    }

    setIsVerifying(true);
    try {
      const success = await verifyEmail(formData.email, otp);
      if (success) {
        setStep(3); // Move to password creation (Step 3)
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.password || formData.password !== formData.confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const fullName =
        `${formData.firstName} ${formData.lastName} ${formData.otherName}`.trim();
      const success = await signup({
        fullName: fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      if (success) {
        Alert.alert("Success", "Account created successfully!");
        router.replace("/login"); // Take them to login after signup
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (formData.firstName && formData.lastName && formData.phone) {
        setStep(2);
      } else {
        Alert.alert(
          "Error",
          "Please fill in all required fields (First and Last Name)",
        );
      }
    } else if (step === 2) {
      if (!showOtpField) {
        handleSendOtp();
      } else {
        handleVerifyOtp();
      }
    } else if (step === 3) {
      handleSignup();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

          {/* Stage Progress */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressStep,
                step >= 1 && styles.activeProgressStep,
              ]}
            >
              <Text style={styles.progressStepText}>1</Text>
            </View>
            <View
              style={[
                styles.progressLine,
                step >= 2 && styles.activeProgressLine,
              ]}
            />
            <View
              style={[
                styles.progressStep,
                step >= 2 && styles.activeProgressStep,
              ]}
            >
              <Text style={styles.progressStepText}>2</Text>
            </View>
            <View
              style={[
                styles.progressLine,
                step >= 3 && styles.activeProgressLine,
              ]}
            />
            <View
              style={[
                styles.progressStep,
                step >= 3 && styles.activeProgressStep,
              ]}
            >
              <Text style={styles.progressStepText}>3</Text>
            </View>
          </View>

          {step === 1 ? (
            <View style={styles.stageContent}>
              <Text style={styles.title}>Basic Information</Text>
              <Text style={styles.subtitle}>
                Let's get started with your name and phone number.
              </Text>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <User
                    color="rgba(255,255,255,0.6)"
                    size={20}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="First Name"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <User
                    color="rgba(255,255,255,0.6)"
                    size={20}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Last Name"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <User
                    color="rgba(255,255,255,0.6)"
                    size={20}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Other Name (Optional)"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    value={formData.otherName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, otherName: text })
                    }
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Phone
                    color="rgba(255,255,255,0.6)"
                    size={20}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: text })
                    }
                  />
                </View>
              </View>
            </View>
          ) : step === 2 ? (
            <View style={styles.stageContent}>
              <Text style={styles.title}>Email Verification</Text>
              <Text style={styles.subtitle}>
                Enter your email to receive a verification code.
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
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(text) =>
                      setFormData({ ...formData, email: text })
                    }
                    editable={!showOtpField}
                  />
                </View>

                {showOtpField && (
                  <View style={[styles.inputContainer, styles.otpContainer]}>
                    <CheckCircle2
                      color="rgba(255,255,255,0.6)"
                      size={20}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Verification Code"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      keyboardType="number-pad"
                      maxLength={6}
                      value={otp}
                      onChangeText={setOtp}
                    />
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.stageContent}>
              <Text style={styles.title}>Secure Your Account</Text>
              <Text style={styles.subtitle}>
                Set a password for your rider account.
              </Text>

              <View style={styles.form}>
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
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) =>
                      setFormData({ ...formData, password: text })
                    }
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
                    placeholder="Confirm Password"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    secureTextEntry
                    value={formData.confirmPassword}
                    onChangeText={(text) =>
                      setFormData({ ...formData, confirmPassword: text })
                    }
                  />
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={nextStep}
            disabled={isLoading || isVerifying}
          >
            <Text style={styles.buttonText}>
              {isLoading || isVerifying
                ? "Processing..."
                : step === 1
                  ? "Continue"
                  : step === 2
                    ? showOtpField
                      ? "Verify & Continue"
                      : "Send Code"
                    : "Complete Signup"}
            </Text>
          </TouchableOpacity>
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
    paddingHorizontal: width * 0.06,
    paddingBottom: 30,
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  backBtn: {
    marginRight: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  logoText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  progressStep: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeProgressStep: {
    backgroundColor: "white",
  },
  progressStepText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 8,
  },
  activeProgressLine: {
    backgroundColor: "white",
  },
  stageContent: {
    flex: 1,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 25,
    lineHeight: 20,
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
  },
  otpContainer: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "white",
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },
});
