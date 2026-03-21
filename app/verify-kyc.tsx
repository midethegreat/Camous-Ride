import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Camera,
  FileText,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  User,
  Mail,
  Building,
  CreditCard,
  Search,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { API_URL } from "@/constants/apiConfig";

const { width } = Dimensions.get("window");

type KYCStep = "info" | "bank" | "id" | "selfie" | "reviewing";

export default function VerifyKYCScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();

  const [step, setStep] = useState<KYCStep>("info");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");

  // Bank verification state
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState<{
    code: string;
    name: string;
  } | null>(null);
  const [accountName, setAccountName] = useState("");
  const [isVerifyingBank, setIsVerifyingBank] = useState(false);
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [showBankList, setShowBankList] = useState(false);
  const [bankSearch, setBankSearch] = useState("");

  const [governmentIdImage, setGovernmentIdImage] = useState<string | null>(
    null,
  );
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch banks on mount
  React.useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      // Mock bank list
      await new Promise((resolve) => setTimeout(resolve, 500));
      const mockBanks = [
        { code: "011", name: "First Bank of Nigeria" },
        { code: "033", name: "United Bank for Africa (UBA)" },
        { code: "044", name: "Access Bank" },
        { code: "058", name: "Guaranty Trust Bank (GTBank)" },
        { code: "057", name: "Zenith Bank" },
        { code: "032", name: "Union Bank of Nigeria" },
        { code: "070", name: "Fidelity Bank" },
        { code: "214", name: "First City Monument Bank (FCMB)" },
        { code: "076", name: "Polaris Bank" },
        { code: "215", name: "Unity Bank" },
      ];
      setBanks(mockBanks);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const verifyBank = async () => {
    if (!accountNumber || !selectedBank) {
      Alert.alert("Error", "Please enter account number and select a bank.");
      return;
    }

    setIsVerifyingBank(true);
    try {
      // Mock bank verification
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (accountNumber.length === 10) {
        setAccountName(user?.fullName || "Adefaka Mosimiloluwa");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        throw new Error("Invalid account number (MOCK: 10 digits required)");
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to verify account.");
    } finally {
      setIsVerifyingBank(false);
    }
  };

  const pickImage = async (type: "id" | "selfie") => {
    if (type === "id") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera roll permissions to upload documents.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.7,
      });

      if (!result.canceled) {
        setGovernmentIdImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else {
      // SELFIE: MUST USE CAMERA
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need camera permissions to take a selfie.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setSelfieImage(result.assets[0].uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleNext = () => {
    if (step === "info") {
      if (!fullName || !email) {
        Alert.alert(
          "Missing Information",
          "Please enter your full name and email.",
        );
        return;
      }
      setStep("bank");
    } else if (step === "bank") {
      if (!accountNumber || !selectedBank || !accountName) {
        Alert.alert(
          "Verification Required",
          "Please select your bank and verify your account number.",
        );
        return;
      }
      setStep("id");
    } else if (step === "id") {
      if (!governmentIdImage) {
        Alert.alert("Document Required", "Please upload your ID card front.");
        return;
      }
      setStep("selfie");
    } else if (step === "selfie") {
      if (!selfieImage) {
        Alert.alert("Selfie Required", "Please take/upload a selfie.");
        return;
      }
      submitKYC();
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const submitKYC = async () => {
    if (!governmentIdImage || !selfieImage || !selectedBank || !accountNumber) {
      Alert.alert("Missing info", "Please complete all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock KYC submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStep("reviewing");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit KYC.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgress = () => {
    const steps: KYCStep[] = ["info", "bank", "id", "selfie"];
    const currentIndex = steps.indexOf(step);

    return (
      <View style={styles.progressContainer}>
        {steps.map((s, idx) => (
          <React.Fragment key={s}>
            <View
              style={[
                styles.progressDot,
                idx <= currentIndex && styles.progressDotActive,
              ]}
            >
              <Text
                style={[
                  styles.progressDotText,
                  idx <= currentIndex && styles.progressDotTextActive,
                ]}
              >
                {idx + 1}
              </Text>
            </View>
            {idx < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  idx < currentIndex && styles.progressLineActive,
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderStep = () => {
    switch (step) {
      case "info":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Personal Details</Text>
            <Text style={styles.stepSubtitle}>
              Please provide your information exactly as it appears on your
              government ID.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="John Doe"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="john@example.com"
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>
        );

      case "bank":
        const filteredBanks = banks.filter((b) =>
          b.name.toLowerCase().includes(bankSearch.toLowerCase()),
        );

        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Bank Account</Text>
            <Text style={styles.stepSubtitle}>
              Verify your bank account for secure transfers and identity
              confirmation.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SELECT BANK</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setShowBankList(true)}
              >
                <Building size={20} color={Colors.gray} />
                <Text
                  style={[
                    styles.input,
                    { color: selectedBank ? Colors.dark : Colors.gray },
                  ]}
                >
                  {selectedBank ? selectedBank.name : "Select your bank"}
                </Text>
                <ChevronRight size={20} color={Colors.gray} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ACCOUNT NUMBER</Text>
              <View style={styles.inputWrapper}>
                <CreditCard size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  value={accountNumber}
                  onChangeText={(val) => {
                    setAccountNumber(val);
                    setAccountName(""); // Reset name if account changes
                  }}
                  placeholder="0123456789"
                  keyboardType="number-pad"
                  maxLength={10}
                />
                {accountNumber.length === 10 && !accountName && (
                  <TouchableOpacity
                    onPress={verifyBank}
                    disabled={isVerifyingBank}
                  >
                    {isVerifyingBank ? (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    ) : (
                      <Text
                        style={{
                          color: Colors.primary,
                          fontWeight: "700",
                          fontSize: 12,
                        }}
                      >
                        VERIFY
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {accountName ? (
              <View style={styles.accountVerifiedBox}>
                <CheckCircle2 size={18} color={"#34C759"} />
                <Text style={styles.accountNameText}>{accountName}</Text>
              </View>
            ) : null}

            {showBankList && (
              <View style={styles.modalOverlay}>
                <View style={styles.bankListModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Bank</Text>
                    <TouchableOpacity onPress={() => setShowBankList(false)}>
                      <Text
                        style={{ color: Colors.primary, fontWeight: "600" }}
                      >
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.searchBar}>
                    <Search size={18} color={Colors.gray} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search banks..."
                      value={bankSearch}
                      onChangeText={setBankSearch}
                    />
                  </View>

                  <ScrollView style={styles.bankListScroll}>
                    {filteredBanks.map((bank) => (
                      <TouchableOpacity
                        key={bank.code}
                        style={styles.bankItem}
                        onPress={() => {
                          setSelectedBank(bank);
                          setShowBankList(false);
                          setAccountName(""); // Reset if bank changes
                        }}
                      >
                        <Text style={styles.bankItemText}>{bank.name}</Text>
                        {selectedBank?.code === bank.code && (
                          <CheckCircle2 size={18} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        );

      case "id":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Document Upload</Text>
            <Text style={styles.stepSubtitle}>
              Upload the front of your government-issued ID (NIN, Driver's
              License, or Student Card).
            </Text>

            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => pickImage("id")}
            >
              {governmentIdImage ? (
                <Image
                  source={{ uri: governmentIdImage }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <FileText size={48} color={Colors.gray} />
                  <Text style={styles.uploadText}>
                    Tap to upload ID Card Front
                  </Text>
                  <Text style={styles.uploadSubtext}>
                    JPG or PNG (max. 5MB)
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      case "selfie":
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Selfie Verification</Text>
            <Text style={styles.stepSubtitle}>
              We need a clear photo of your face to match with your ID document.
            </Text>

            <TouchableOpacity
              style={[styles.uploadBox, styles.selfieBox]}
              onPress={() => pickImage("selfie")}
            >
              {selfieImage ? (
                <Image
                  source={{ uri: selfieImage }}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Camera size={48} color={Colors.gray} />
                  <Text style={styles.uploadText}>Tap to take a Selfie</Text>
                  <Text style={styles.uploadSubtext}>
                    Ensure your face is clearly visible
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        );

      case "reviewing":
        return (
          <View style={styles.successContainer}>
            <View style={styles.successIconWrapper}>
              <CheckCircle2 size={80} color={Colors.primary} />
            </View>
            <Text style={styles.successTitle}>Under Review</Text>
            <Text style={styles.successText}>
              Your documents have been submitted successfully. Our team is now
              reviewing your application. This usually takes less than 2
              minutes.
            </Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.doneBtnText}>Back to Profile</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            if (step === "info") router.back();
            else if (step === "bank") setStep("info");
            else if (step === "id") setStep("bank");
            else if (step === "selfie") setStep("id");
          }}
        >
          <ArrowLeft size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <View style={{ width: 40 }} />
      </View>

      {step !== "reviewing" && renderProgress()}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStep()}

        {step !== "reviewing" && (
          <TouchableOpacity
            style={[styles.nextBtn, isSubmitting && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Text style={styles.nextBtnText}>
                  {step === "selfie" ? "Submit Verification" : "Continue"}
                </Text>
                {step !== "selfie" && (
                  <ChevronRight size={20} color={Colors.white} />
                )}
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.dark,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  progressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
  },
  progressDotActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  progressDotText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gray,
  },
  progressDotTextActive: {
    color: Colors.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.dark,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.gray,
    lineHeight: 22,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gray,
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.dark,
    fontWeight: "500",
  },
  uploadBox: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.background,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 24,
  },
  selfieBox: {
    height: 300,
    width: "100%",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  uploadText: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: "700",
    textAlign: "center",
  },
  uploadSubtext: {
    fontSize: 13,
    color: Colors.gray,
    textAlign: "center",
  },
  nextBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnDisabled: {
    backgroundColor: Colors.lightGray,
    elevation: 0,
  },
  nextBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.white,
  },
  successContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.dark,
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  doneBtn: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 14,
  },
  doneBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  accountVerifiedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 24,
  },
  accountNameText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#34C759",
    textTransform: "uppercase",
  },
  modalOverlay: {
    position: "absolute",
    top: -500,
    left: -24,
    right: -24,
    bottom: -1000,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 1000,
  },
  bankListModal: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: "80%",
    padding: 24,
    marginTop: 100,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.dark,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    fontSize: 16,
  },
  bankListScroll: {
    flex: 1,
  },
  bankItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  bankItemText: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: "500",
  },
});
