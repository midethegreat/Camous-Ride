import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Mail,
  User2,
  IdCard,
  Camera,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import Colors from "@/_constants/Colors";
import { API_URL } from "@/_constants/apiConfig";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function GuestOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other" | "">("");
  const [employmentStatus, setEmploymentStatus] = useState<
    "Student" | "Staff" | "Self-employed" | "Unemployed" | "Other" | ""
  >("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nationalIdUri, setNationalIdUri] = useState<string | null>(null);
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const resendRef = useRef<NodeJS.Timer | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const loader = useRef(new Animated.Value(0.9)).current;
  const progress = useRef(new Animated.Value(1 / 6)).current;

  const animateTo = (value: number) => {
    Animated.timing(progress, {
      toValue: value,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    if (resendTimer > 0) {
      if (resendRef.current) clearInterval(resendRef.current as any);
      resendRef.current = setInterval(() => {
        setResendTimer((s) => {
          if (s <= 1) {
            if (resendRef.current) clearInterval(resendRef.current as any);
            resendRef.current = null;
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (resendRef.current) {
        clearInterval(resendRef.current as any);
        resendRef.current = null;
      }
    }
    return () => {
      if (resendRef.current) {
        clearInterval(resendRef.current as any);
        resendRef.current = null;
      }
    };
  }, [resendTimer]);

  useEffect(() => {
    if (redirecting) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loader, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(loader, {
            toValue: 0.9,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [redirecting, loader]);

  const pickImage = async (setter: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant media permissions to select an image.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });
    if (!result.canceled) {
      setter(result.assets[0].uri);
    }
  };

  const submitGuestRegistration = async () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Missing info", "Enter your full name and email.");
      return;
    }
    try {
      setEmailError(null);
      setLoading(true);
      const timeoutMs = 8000;
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${API_URL}/api/guests/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
        signal: controller.signal,
      }).finally(() => clearTimeout(t));
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = data.message || "Failed to send code.";
        if (msg.toLowerCase().includes("email")) {
          setStep(2);
          setEmailError(msg);
          return;
        }
        throw new Error(msg);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Code Sent", `We sent a verification code to ${email}.`);
      if (resendTimer === 0) {
        setResendTimer(120);
      }
    } catch (e: any) {
      const msg =
        e?.name === "AbortError"
          ? "Request timed out. Check backend is running and reachable."
          : e?.message || "Could not start verification.";
      if (String(msg).toLowerCase().includes("email")) {
        setStep(2);
        setEmailError(String(msg));
      } else {
        Alert.alert("Error", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const uploadDocs = async () => {
    if (!nationalIdUri || !selfieUri) {
      Alert.alert("Missing images", "Upload your national ID and a selfie.");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/guests/upload-docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fullName,
          nationalIdUrl: nationalIdUri,
          selfieUrl: selfieUri,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data.message || "Failed to upload documents.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRedirecting(true);
      animateTo(1);
      setTimeout(() => {
        router.replace("/" as never);
      }, 1600);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not upload documents.");
    } finally {
      setLoading(false);
    }
  };

  const verifyGuestOtp = async () => {
    if (otp.length < 4) {
      Alert.alert(
        "Invalid code",
        "Enter the verification code sent to your email.",
      );
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/guests/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Verification failed.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Mark guest as verified for routing, persist basic guest profile, and go to home
      await AsyncStorage.setItem("cid_guest_auth", "true");
      const prev = await AsyncStorage.getItem("cid_guest_profile").catch(
        () => null,
      );
      const prevJson = prev ? JSON.parse(prev) : {};
      const profile = {
        fullName: fullName || prevJson.fullName || "",
        email: email || prevJson.email || "",
        bio: prevJson.bio || "",
        phoneNumber: prevJson.phoneNumber || "",
        gender: gender || prevJson.gender || "",
        employmentStatus: employmentStatus || prevJson.employmentStatus || "",
      };
      await AsyncStorage.setItem("cid_guest_profile", JSON.stringify(profile));
      router.replace("/" as never);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (step > 1) {
              const prev = (step - 1) as Step;
              setStep(prev);
              animateTo(prev / 6);
            } else {
              router.back();
            }
          }}
          style={styles.headerBackBtn}
          activeOpacity={0.8}
          hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
        >
          <ArrowLeft size={18} color={Colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerTop}>
          <Image
            source={require("../assets/images/colisdav.png")}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Guest Verification</Text>
          <Text style={styles.stepMeta}>Step {step} of 6</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0%", "100%"],
                }),
              },
            ]}
          />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step === 1 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Profile Information</Text>
            <Text style={styles.stepDesc}>
              Fill your profile to create an account.
            </Text>
            <Text style={styles.inputLabel}>FULL NAME</Text>
            <View style={styles.inputRow}>
              <User2 size={18} color={Colors.gray} />
              <TextInput
                style={styles.input}
                placeholder="John A. Doe"
                placeholderTextColor={Colors.lightGray}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>GENDER</Text>
            <View style={styles.chipRow}>
              {["Male", "Female", "Other"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, gender === g && styles.chipActive]}
                  onPress={() => setGender(g as any)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.chipText,
                      gender === g && styles.chipTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={[styles.inputLabel, { marginTop: 12 }]}>
              EMPLOYMENT STATUS
            </Text>
            <View style={styles.chipRow}>
              {["Student", "Staff", "Self-employed", "Unemployed", "Other"].map(
                (e) => (
                  <TouchableOpacity
                    key={e}
                    style={[
                      styles.chip,
                      employmentStatus === e && styles.chipActive,
                    ]}
                    onPress={() => setEmploymentStatus(e as any)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        employmentStatus === e && styles.chipTextActive,
                      ]}
                    >
                      {e}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!fullName || !gender || !employmentStatus || loading) &&
                  styles.btnDisabled,
              ]}
              onPress={() => {
                if (!fullName.trim() || !gender || !employmentStatus) return;
                AsyncStorage.setItem(
                  "cid_guest_profile",
                  JSON.stringify({
                    fullName,
                    email: "",
                    bio: "",
                    phoneNumber: "",
                    gender,
                    employmentStatus,
                  }),
                ).catch(() => {});
                setStep(2);
                animateTo(2 / 6);
              }}
              disabled={!fullName || !gender || !employmentStatus || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Enter Email</Text>
            <Text style={styles.stepDesc}>
              Provide your email for account verification.
            </Text>
            <Text style={styles.inputLabel}>EMAIL</Text>
            <View style={styles.inputRow}>
              <Mail size={18} color={Colors.gray} />
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={Colors.lightGray}
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {emailError ? (
              <Text style={styles.fieldError}>{emailError}</Text>
            ) : null}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!email || loading) && styles.btnDisabled,
              ]}
              onPress={async () => {
                if (!email.trim()) return;
                try {
                  setLoading(true);
                  const res = await fetch(
                    `${API_URL}/api/guests/check-email?email=${encodeURIComponent(email)}`,
                  );
                  const data = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(data.message || "Check failed");
                  if (data.available) {
                    setStep(3);
                    animateTo(3 / 6);
                    setEmailError(null);
                  } else {
                    setEmailError(data.message || "Email already in use");
                  }
                } catch (e: any) {
                  const msg = e?.message || "Could not check email";
                  if (msg.toLowerCase().includes("email")) {
                    setEmailError(msg);
                  } else {
                    Alert.alert("Error", msg);
                  }
                } finally {
                  setLoading(false);
                }
              }}
              disabled={!email || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Create Password</Text>
            <Text style={styles.stepDesc}>
              Set a secure password for your guest account.
            </Text>
            <Text style={styles.inputLabel}>PASSWORD</Text>
            <View style={styles.inputRow}>
              <ShieldCheck size={18} color={Colors.gray} />
              <TextInput
                style={[styles.input, styles.inputWithEye]}
                placeholder="Minimum 6 characters"
                placeholderTextColor={Colors.lightGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color={Colors.gray} />
                ) : (
                  <Eye size={18} color={Colors.gray} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
            <View style={styles.inputRow}>
              <ShieldCheck size={18} color={Colors.gray} />
              <TextInput
                style={[styles.input, styles.inputWithEye]}
                placeholder="Re-enter password"
                placeholderTextColor={Colors.lightGray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowConfirm((v) => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showConfirm ? (
                  <EyeOff size={18} color={Colors.gray} />
                ) : (
                  <Eye size={18} color={Colors.gray} />
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (loading || !password || password !== confirmPassword) &&
                  styles.btnDisabled,
              ]}
              onPress={() => {
                if (!password || password !== confirmPassword) return;
                setStep(4);
                animateTo(4 / 6);
              }}
              disabled={!password || password !== confirmPassword || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Email Verification</Text>
            <Text style={styles.stepDesc}>
              We will email a code to {email || "your address"}.
            </Text>
            <Text style={styles.inputLabel}>VERIFICATION CODE</Text>
            <View style={styles.inputRow}>
              <ShieldCheck size={18} color={Colors.gray} />
              <TextInput
                style={styles.input}
                placeholder="e.g. 123456"
                placeholderTextColor={Colors.lightGray}
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
            <View style={styles.resendRow}>
              <TouchableOpacity
                onPress={submitGuestRegistration}
                disabled={!email || loading || resendTimer > 0}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.resendText,
                    (!email || resendTimer > 0) && styles.resendDisabled,
                  ]}
                >
                  {resendTimer > 0 ? "Resend code" : "Send code"}
                </Text>
              </TouchableOpacity>
              {resendTimer > 0 ? (
                <Text style={styles.countdownText}>
                  {`${String(Math.floor(resendTimer / 60)).padStart(2, "0")}:${String(resendTimer % 60).padStart(2, "0")}`}
                </Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={verifyGuestOtp}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? "Verifying..." : "Verify"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center", marginTop: 8 }}
              onPress={() => router.push("/guest-login" as never)}
              activeOpacity={0.7}
            >
              <Text style={{ color: Colors.gray, fontSize: 13 }}>
                Already a guest? Log in
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 5 && (
          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>Upload ID Card</Text>
            <Text style={styles.stepDesc}>Upload your national ID card.</Text>
            <Text style={styles.inputLabel}>NATIONAL ID CARD</Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => pickImage((uri) => setNationalIdUri(uri))}
            >
              {nationalIdUri ? (
                <Image source={{ uri: nationalIdUri }} style={styles.preview} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <IdCard size={36} color={Colors.gray} />
                  <Text style={styles.uploadText}>Tap to upload ID</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!nationalIdUri || loading) && styles.btnDisabled,
              ]}
              onPress={() => {
                if (!nationalIdUri) return;
                setStep(6);
                animateTo(6 / 6);
              }}
              disabled={!nationalIdUri || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 6 && (
          <View style={styles.stepCard}>
            {!redirecting ? (
              <>
                <Text style={styles.stepTitle}>Take Selfie</Text>
                <Text style={styles.stepDesc}>
                  Upload a clear selfie for identity confirmation.
                </Text>
                <Text style={styles.inputLabel}>SELFIE</Text>
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={() => pickImage((uri) => setSelfieUri(uri))}
                >
                  {selfieUri ? (
                    <Image source={{ uri: selfieUri }} style={styles.preview} />
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Camera size={36} color={Colors.gray} />
                      <Text style={styles.uploadText}>
                        Tap to upload selfie
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    (!selfieUri || loading) && styles.btnDisabled,
                  ]}
                  onPress={uploadDocs}
                  disabled={!selfieUri || loading}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryBtnText}>
                    {loading ? "Uploading..." : "Submit"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={{ alignItems: "center", paddingVertical: 24 }}>
                <Animated.View
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 42,
                    backgroundColor: Colors.primary,
                    opacity: 0.9,
                    transform: [{ scale: loader }],
                  }}
                />
                <Text style={{ marginTop: 12, color: Colors.gray }}>
                  Finalizing your account…
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBackBtn: {
    position: "absolute",
    left: 16,
    top: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  headerTop: { alignItems: "center", marginBottom: 8 },
  headerLogo: { width: 120, height: 120, marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: "800" as const, color: Colors.dark },
  stepMeta: { fontSize: 12, color: Colors.gray, marginTop: 4 },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 6, backgroundColor: Colors.primary },
  scrollContent: { padding: 20, gap: 14 },
  stepCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    color: Colors.dark,
    marginBottom: 6,
  },
  stepDesc: { fontSize: 13, color: Colors.gray, marginBottom: 16 },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700" as const,
    color: Colors.gray,
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: Colors.white,
  },
  input: { flex: 1, fontSize: 16, color: Colors.dark },
  inputWithEye: { paddingRight: 40 },
  eyeBtn: { position: "absolute", right: 12, top: 16 },
  primaryBtn: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "800" as const,
  },
  btnDisabled: { opacity: 0.5 },
  uploadBox: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  uploadPlaceholder: { alignItems: "center" },
  uploadText: { marginTop: 8, color: Colors.gray, fontSize: 13 },
  preview: { width: "100%", height: "100%" },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 4,
  },
  resendText: {
    fontSize: 13,
    color: Colors.primary,
    textDecorationLine: "underline",
  },
  resendDisabled: { color: Colors.gray, textDecorationLine: "none" },
  countdownText: { fontSize: 13, color: Colors.gray },
  fieldError: { color: Colors.red, marginTop: 6, fontSize: 12 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    color: Colors.gray,
    fontWeight: "700",
    fontSize: 12,
  },
  chipTextActive: {
    color: Colors.primary,
  },
});
