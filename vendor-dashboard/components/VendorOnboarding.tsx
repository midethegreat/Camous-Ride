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
} from "react-native";
import { useRouter } from "expo-router";
import {
  Store,
  MapPin,
  Phone,
  Mail,
  User,
  Upload,
  ChevronRight,
} from "lucide-react-native";
import Colors from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface VendorData {
  businessName: string;
  businessType: string;
  address: string;
  phone: string;
  email: string;
  description: string;
  licenseNumber: string;
}

export default function VendorOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [vendorData, setVendorData] = useState<VendorData>({
    businessName: "",
    businessType: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    licenseNumber: "",
  });

  const steps = [
    { title: "Business Information", icon: Store },
    { title: "Contact Details", icon: Phone },
    { title: "Verification", icon: Mail },
    { title: "Complete", icon: User },
  ];

  const businessTypes = [
    "Restaurant",
    "Food Truck",
    "Café",
    "Bakery",
    "Grocery Store",
    "Other",
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit vendor application
      Alert.alert(
        "Application Submitted!",
        "Your vendor application has been received. We will review it within 24-48 hours.",
        [
          {
            text: "Continue",
            onPress: () => router.push("/vendor-dashboard" as never),
          },
        ],
      );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Tell us about your business</Text>
            <Text style={styles.stepSubtitle}>
              This information helps us verify your business and create your
              vendor profile
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your business name"
                value={vendorData.businessName}
                onChangeText={(text) =>
                  setVendorData({ ...vendorData, businessName: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Type *</Text>
              <View style={styles.businessTypeGrid}>
                {businessTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.businessTypeButton,
                      vendorData.businessType === type &&
                        styles.businessTypeButtonActive,
                    ]}
                    onPress={() =>
                      setVendorData({ ...vendorData, businessType: type })
                    }
                  >
                    <Text
                      style={[
                        styles.businessTypeText,
                        vendorData.businessType === type &&
                          styles.businessTypeTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your business (optional)"
                value={vendorData.description}
                onChangeText={(text) =>
                  setVendorData({ ...vendorData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Contact Information</Text>
            <Text style={styles.stepSubtitle}>
              How can we reach you and where is your business located?
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Address *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={Colors.gray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconField]}
                  placeholder="Enter your business address"
                  value={vendorData.address}
                  onChangeText={(text) =>
                    setVendorData({ ...vendorData, address: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.inputWithIcon}>
                <Phone size={20} color={Colors.gray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconField]}
                  placeholder="Enter your phone number"
                  value={vendorData.phone}
                  onChangeText={(text) =>
                    setVendorData({ ...vendorData, phone: text })
                  }
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={20} color={Colors.gray} />
                <TextInput
                  style={[styles.input, styles.inputWithIconField]}
                  placeholder="Enter your email address"
                  value={vendorData.email}
                  onChangeText={(text) =>
                    setVendorData({ ...vendorData, email: text })
                  }
                  keyboardType="email-address"
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Business Verification</Text>
            <Text style={styles.stepSubtitle}>
              Upload required documents to verify your business
            </Text>

            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Business License</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Upload size={24} color={Colors.primary} />
                <Text style={styles.uploadText}>Upload Business License</Text>
                <Text style={styles.uploadSubtitle}>
                  PDF, JPG, PNG (max 5MB)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Business Logo</Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Upload size={24} color={Colors.primary} />
                <Text style={styles.uploadText}>Upload Business Logo</Text>
                <Text style={styles.uploadSubtitle}>
                  JPG, PNG (max 2MB, 500x500px recommended)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>License Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your business license number"
                value={vendorData.licenseNumber}
                onChangeText={(text) =>
                  setVendorData({ ...vendorData, licenseNumber: text })
                }
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <User size={48} color={Colors.primary} />
              </View>
              <Text style={styles.successTitle}>Almost Done!</Text>
              <Text style={styles.successSubtitle}>
                Your vendor application has been submitted successfully. We'll
                review your information and get back to you within 24-48 hours.
              </Text>
              <Text style={styles.successInfo}>
                You can start setting up your menu and products while we review
                your application.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.headerTitle}>Vendor Onboarding</Text>
        <Text style={styles.headerSubtitle}>
          Step {currentStep + 1} of {steps.length}
        </Text>
      </View>

      <View style={styles.progressContainer}>
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <View key={index} style={styles.progressStep}>
              <View
                style={[
                  styles.progressCircle,
                  index <= currentStep && styles.progressCircleActive,
                ]}
              >
                <Icon
                  size={16}
                  color={index <= currentStep ? Colors.white : Colors.gray}
                />
              </View>
              <Text
                style={[
                  styles.progressLabel,
                  index <= currentStep && styles.progressLabelActive,
                ]}
              >
                {step.title}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.contentContainer}>{renderStepContent()}</View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            currentStep === steps.length - 1 && styles.submitButton,
          ]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? "Complete Setup" : "Continue"}
          </Text>
          <ChevronRight size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  progressCircleActive: {
    backgroundColor: Colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: "center",
  },
  progressLabelActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  stepContent: {
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.dark,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWithIconField: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },
  businessTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  businessTypeButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  businessTypeButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  businessTypeText: {
    fontSize: 14,
    color: Colors.gray,
  },
  businessTypeTextActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
  uploadSection: {
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
    marginTop: 8,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  successContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  successInfo: {
    fontSize: 14,
    color: Colors.primary,
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: Colors.green,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
    marginRight: 8,
  },
});
