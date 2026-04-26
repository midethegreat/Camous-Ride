import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Upload,
  MapPin,
  Phone,
  Mail,
  User,
  Store,
} from "lucide-react-native";
import { Colors } from "@/constants/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VendorOnboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [businessInfo, setBusinessInfo] = useState({
    businessName: "",
    businessType: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  });

  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    phone: "",
    email: "",
    idNumber: "",
  });

  const [documents, setDocuments] = useState({
    businessLicense: null,
    idDocument: null,
    profileImage: null,
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Success!",
        "Your vendor application has been submitted for review.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/vendor-dashboard"),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View
          key={index}
          style={[
            styles.stepDot,
            {
              backgroundColor:
                index + 1 <= currentStep ? Colors.primary : Colors.lightGray,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Business Information</Text>
            <Text style={styles.stepDescription}>
              Tell us about your business
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name *</Text>
              <View style={styles.inputContainer}>
                <Store size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your business name"
                  value={businessInfo.businessName}
                  onChangeText={(text) =>
                    setBusinessInfo({ ...businessInfo, businessName: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Type *</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Restaurant, Store, Service"
                  value={businessInfo.businessType}
                  onChangeText={(text) =>
                    setBusinessInfo({ ...businessInfo, businessType: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your business"
                multiline
                numberOfLines={4}
                value={businessInfo.description}
                onChangeText={(text) =>
                  setBusinessInfo({ ...businessInfo, description: text })
                }
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Address *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your business address"
                  value={businessInfo.address}
                  onChangeText={(text) =>
                    setBusinessInfo({ ...businessInfo, address: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Phone *</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter business phone number"
                  keyboardType="phone-pad"
                  value={businessInfo.phone}
                  onChangeText={(text) =>
                    setBusinessInfo({ ...businessInfo, phone: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Email *</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter business email"
                  keyboardType="email-address"
                  value={businessInfo.email}
                  onChangeText={(text) =>
                    setBusinessInfo({ ...businessInfo, email: text })
                  }
                />
              </View>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Personal Information</Text>
            <Text style={styles.stepDescription}>
              Your personal details for verification
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={personalInfo.fullName}
                  onChangeText={(text) =>
                    setPersonalInfo({ ...personalInfo, fullName: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                  value={personalInfo.phone}
                  onChangeText={(text) =>
                    setPersonalInfo({ ...personalInfo, phone: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Colors.gray} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  value={personalInfo.email}
                  onChangeText={(text) =>
                    setPersonalInfo({ ...personalInfo, email: text })
                  }
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>ID Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your ID number"
                value={personalInfo.idNumber}
                onChangeText={(text) =>
                  setPersonalInfo({ ...personalInfo, idNumber: text })
                }
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Upload Documents</Text>
            <Text style={styles.stepDescription}>
              Required documents for verification
            </Text>

            <TouchableOpacity style={styles.uploadCard}>
              <Upload size={32} color={Colors.primary} />
              <Text style={styles.uploadTitle}>Business License</Text>
              <Text style={styles.uploadDescription}>
                Upload your business license or registration certificate
              </Text>
              <Text style={styles.uploadButton}>Choose File</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard}>
              <Upload size={32} color={Colors.primary} />
              <Text style={styles.uploadTitle}>ID Document</Text>
              <Text style={styles.uploadDescription}>
                Upload a valid government-issued ID
              </Text>
              <Text style={styles.uploadButton}>Choose File</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.uploadCard}>
              <Upload size={32} color={Colors.primary} />
              <Text style={styles.uploadTitle}>Profile Photo</Text>
              <Text style={styles.uploadDescription}>
                Upload a clear profile photo
              </Text>
              <Text style={styles.uploadButton}>Choose File</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vendor Registration</Text>
          <View style={{ width: 40 }} />
        </View>

        {renderStepIndicator()}

        {renderStepContent()}

        <View style={styles.buttonContainer}>
          {currentStep < totalSteps ? (
            <TouchableOpacity style={styles.primaryButton} onPress={handleNext}>
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Submitting..." : "Submit Application"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.gray,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.dark,
    marginLeft: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadCard: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 12,
    marginBottom: 4,
  },
  uploadDescription: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: "center",
    marginBottom: 16,
  },
  uploadButton: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: Colors.lightGray,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});
