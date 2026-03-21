import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  Camera,
  Upload,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  User,
  Car,
  CreditCard,
  Smile,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/color";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "expo-router";

type KycStep = 1 | 2 | 3 | 4 | 5;

export default function KYCVerificationScreen() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState<KycStep>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState<string | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    idImage: null as string | null,
    vehicleImage: null as string | null,
    plateNumber: "",
    plateImage: null as string | null,
    selfieImage: null as string | null,
  });

  useEffect(() => {
    if (user?.fullName) {
      setFormData((prev) => ({ ...prev, fullName: user.fullName }));
    }
  }, [user]);

  const pickImage = async (
    field: keyof typeof formData,
    useCamera: boolean = true,
  ) => {
    try {
      setIsProcessingImage(field);

      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: libraryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (useCamera && cameraStatus !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera permissions to proceed.",
        );
        return;
      }
      if (!useCamera && libraryStatus !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need gallery permissions to proceed.",
        );
        return;
      }

      let result;
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });
      }

      if (!result.canceled) {
        setFormData((prev) => ({ ...prev, [field]: result.assets[0].uri }));
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to capture or select image.");
    } finally {
      setIsProcessingImage(null);
    }
  };

  const handleImageAction = (field: keyof typeof formData) => {
    // Selfie is camera only
    if (field === "selfieImage") {
      pickImage(field, true);
      return;
    }

    Alert.alert(
      "Select Source",
      "Would you like to take a photo or choose from your gallery?",
      [
        { text: "Take Photo", onPress: () => pickImage(field, true) },
        { text: "Choose from Gallery", onPress: () => pickImage(field, false) },
        { text: "Cancel", style: "cancel" },
      ],
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.fullName) {
      Alert.alert("Required", "Please ensure your full name is correct.");
      return;
    }
    if (currentStep === 2 && !formData.idImage) {
      Alert.alert("Required", "Please upload a picture of your ID.");
      return;
    }
    if (currentStep === 3 && !formData.vehicleImage) {
      Alert.alert("Required", "Please upload a picture of your vehicle.");
      return;
    }
    if (currentStep === 4 && (!formData.plateNumber || !formData.plateImage)) {
      Alert.alert(
        "Required",
        "Please provide your plate number and its picture.",
      );
      return;
    }
    if (currentStep === 5 && !formData.selfieImage) {
      Alert.alert("Required", "Please take a selfie to proceed.");
      return;
    }

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as KycStep);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // 1. Simulate uploading to server
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // 2. Update local profile state to "submitted"
      if (updateProfile) {
        await updateProfile({ kycStatus: "submitted" });
      }
      
      Alert.alert(
        "Verification Submitted", 
        "Your documents have been sent to admin for preview. You will be notified once approved.", 
        [
          { 
            text: "View Status", 
            onPress: () => {
              // 3. Simulate Admin Review & Auto-Approval after 5 seconds
              setTimeout(async () => {
                if (updateProfile) {
                  await updateProfile({ kycStatus: "verified" });
                  console.log("Admin simulated: KYC Approved!");
                }
              }, 5000);
              router.replace("/(tabs)"); 
            } 
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <User size={64} color={Colors.primary} style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Confirm Full Name</Text>
            <Text style={styles.stepDesc}>
              This name will be used for your official verification.
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                editable={false} // Automatically filled from registration
                placeholder="Full Name"
              />
              <CheckCircle
                size={20}
                color={Colors.success}
                style={styles.inputCheck}
              />
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <CreditCard
              size={64}
              color={Colors.primary}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>Document Verification</Text>
            <Text style={styles.stepDesc}>
              Upload or take a clear photo of your Government ID.
            </Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleImageAction("idImage")}
              disabled={isProcessingImage === "idImage"}
            >
              {isProcessingImage === "idImage" ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : formData.idImage ? (
                <Image
                  source={{ uri: formData.idImage }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <Camera size={32} color={Colors.textMuted} />
                  <Text style={styles.uploadText}>
                    Capture or Upload ID Card
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <Car size={64} color={Colors.primary} style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Vehicle Picture</Text>
            <Text style={styles.stepDesc}>
              Upload or take a clear photo showing your vehicle's full body.
            </Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleImageAction("vehicleImage")}
              disabled={isProcessingImage === "vehicleImage"}
            >
              {isProcessingImage === "vehicleImage" ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : formData.vehicleImage ? (
                <Image
                  source={{ uri: formData.vehicleImage }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <Camera size={32} color={Colors.textMuted} />
                  <Text style={styles.uploadText}>
                    Capture or Upload Vehicle
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <FileText
              size={64}
              color={Colors.primary}
              style={styles.stepIcon}
            />
            <Text style={styles.stepTitle}>Plate Number</Text>
            <Text style={styles.stepDesc}>
              Enter your plate number and provide a clear photo of it.
            </Text>
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              value={formData.plateNumber}
              onChangeText={(text) =>
                setFormData({ ...formData, plateNumber: text })
              }
              placeholder="Enter Plate Number (e.g. ABC-123DE)"
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleImageAction("plateImage")}
              disabled={isProcessingImage === "plateImage"}
            >
              {isProcessingImage === "plateImage" ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : formData.plateImage ? (
                <Image
                  source={{ uri: formData.plateImage }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <Camera size={32} color={Colors.textMuted} />
                  <Text style={styles.uploadText}>
                    Capture or Upload Plate Number
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <Smile size={64} color={Colors.primary} style={styles.stepIcon} />
            <Text style={styles.stepTitle}>Take a Selfie</Text>
            <Text style={styles.stepDesc}>
              Ensure your face is clearly visible. Camera capture required.
            </Text>
            <TouchableOpacity
              style={styles.uploadBox}
              onPress={() => handleImageAction("selfieImage")}
              disabled={isProcessingImage === "selfieImage"}
            >
              {isProcessingImage === "selfieImage" ? (
                <ActivityIndicator size="large" color={Colors.primary} />
              ) : formData.selfieImage ? (
                <Image
                  source={{ uri: formData.selfieImage }}
                  style={styles.previewImage}
                />
              ) : (
                <>
                  <Camera size={32} color={Colors.textMuted} />
                  <Text style={styles.uploadText}>
                    Capture Selfie (Camera Only)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            currentStep > 1
              ? setCurrentStep((currentStep - 1) as KycStep)
              : router.back()
          }
        >
          <ChevronLeft size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
        <Text style={styles.stepCount}>Step {currentStep}/5</Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressInner,
            { width: `${(currentStep / 5) * 100}%` },
          ]}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, isLoading && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === 5 ? "Submit Verification" : "Next Step"}
              </Text>
              {currentStep < 5 && <ChevronRight size={20} color="white" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  stepCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F3F4F6",
    width: "100%",
  },
  progressInner: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 25,
  },
  stepContainer: {
    alignItems: "center",
  },
  stepIcon: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 10,
  },
  stepDesc: {
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
  },
  inputWrapper: {
    width: "100%",
    position: "relative",
  },
  input: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
  },
  inputCheck: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  uploadBox: {
    width: "100%",
    aspectRatio: 1.5,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  nextButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
