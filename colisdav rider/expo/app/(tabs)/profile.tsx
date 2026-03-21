import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  User,
  Car,
  FileText,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  CheckCircle2,
  AlertCircle,
  Camera,
  Edit3,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/contexts/AuthContext";
import {
  driverProfile as mockDriverProfile,
  vehicleInfo as mockVehicleInfo,
} from "@/constants/driver-data";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems = [
    {
      icon: User,
      title: "Personal Information",
      subtitle: "Edit identity details",
      color: Colors.primary,
      route: "/driver/personal-info",
    },
    {
      icon: Car,
      title: "Vehicle Information",
      subtitle: "Manage your keke details",
      color: Colors.info,
      route: "/driver/vehicle-info",
    },
    {
      icon: FileText,
      title: "Documents",
      subtitle: "License, registration & permits",
      color: Colors.warning,
      route: "/documents",
    },
    {
      icon: Shield,
      title: "Safety & Security",
      subtitle: "PIN & emergency contacts",
      color: Colors.success,
      route: "/driver/safety",
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      subtitle: "FAQs and contact us",
      color: Colors.textSecondary,
      route: "/driver/support",
    },
  ];

  const getDocumentStatus = () => {
    // Safely access documents from mock data or user
    const docs = mockVehicleInfo.documents;
    if (!docs) return { total: 0, verified: 0, pending: 0 };

    const total = Object.keys(docs).length;
    const verified = Object.values(docs).filter(
      (d: any) => d.status === "verified",
    ).length;
    return { total, verified, pending: total - verified };
  };

  const docStatus = getDocumentStatus();

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };

  const handleImageUpload = async (source: "camera" | "gallery") => {
    try {
      setIsUploading(true);

      const hasPermission =
        source === "camera"
          ? await requestCameraPermission()
          : await requestGalleryPermission();

      if (!hasPermission) {
        Alert.alert(
          "Permission Required",
          `Please grant ${source === "camera" ? "camera" : "gallery"} permission to upload your profile picture.`,
        );
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            })
          : await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0].uri;
        setProfileImage(selectedImage);

        // Here you would typically upload to your backend
        // For now, we'll just show a success message
        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to upload profile picture. Please try again.",
      );
      console.error("Image upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const showImagePickerOptions = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Take Photo",
            "Choose from Gallery",
            "Remove Photo",
          ],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 3,
        },
        (buttonIndex) => {
          switch (buttonIndex) {
            case 1:
              handleImageUpload("camera");
              break;
            case 2:
              handleImageUpload("gallery");
              break;
            case 3:
              setProfileImage(null);
              break;
          }
        },
      );
    } else {
      Alert.alert("Profile Picture", "Choose an option", [
        { text: "Cancel", style: "cancel" },
        { text: "Take Photo", onPress: () => handleImageUpload("camera") },
        {
          text: "Choose from Gallery",
          onPress: () => handleImageUpload("gallery"),
        },
        {
          text: "Remove Photo",
          onPress: () => setProfileImage(null),
          style: "destructive",
        },
      ]);
    }
  };

  if (authLoading || loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>
          Please sign in to view your profile.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.retryText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <Text style={styles.headerSubtitle}>DRIVER ACCOUNT</Text>
        </View>

        {/* Profile Card with Picture Upload */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              style={styles.avatarWrapper}
              onPress={showImagePickerOptions}
              disabled={isUploading}
            >
              <Image
                source={{
                  uri: profileImage || user?.avatar || mockDriverProfile.avatar,
                }}
                style={styles.avatar}
              />
              <View style={styles.cameraOverlay}>
                <Camera size={16} color={Colors.white} />
              </View>
            </TouchableOpacity>
            {user.kycStatus === "verified" && (
              <View style={styles.verifiedBadge}>
                <CheckCircle2 size={14} color={Colors.white} />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.fullName || "Driver"}</Text>
            <Text style={styles.profileId}>
              {user?.id?.substring(0, 8).toUpperCase() || "DRV-000"} • DRIVER
            </Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color={Colors.warning} fill={Colors.warning} />
              <Text style={styles.ratingText}>{user?.rating || 0}</Text>
              <Text style={styles.tripsText}>
                ({user?.totalTrips || 0} trips)
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={showImagePickerOptions}
          >
            <Edit3 size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.totalTrips || 0}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.rating || 0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.memberSince || "Jan 2024"}
            </Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
        </View>

        {/* Vehicle Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Vehicle</Text>
            <TouchableOpacity>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleType}>
                {user.vehicle?.type || mockVehicleInfo.type}
              </Text>
              <Text style={styles.vehicleDetails}>
                {user.vehicle?.plateNumber || mockVehicleInfo.plateNumber} •{" "}
                {user.vehicle?.color || mockVehicleInfo.color}
              </Text>
              <Text style={styles.vehicleModel}>
                {user.vehicle?.model || mockVehicleInfo.model} •{" "}
                {user.vehicle?.year || mockVehicleInfo.year}
              </Text>
            </View>
            <View style={styles.capacityBadge}>
              <Text style={styles.capacityText}>
                {user.vehicle?.capacity || mockVehicleInfo.capacity} Seats
              </Text>
            </View>
          </View>
        </View>

        {/* Documents Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.docCard}>
            {docStatus.pending > 0 ? (
              <View style={styles.docAlert}>
                <AlertCircle size={20} color={Colors.warning} />
                <View style={styles.docAlertText}>
                  <Text style={styles.docAlertTitle}>Action Required</Text>
                  <Text style={styles.docAlertSubtitle}>
                    {docStatus.pending} document(s) pending verification
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.docAlert}>
                <CheckCircle2 size={20} color={Colors.success} />
                <View style={styles.docAlertText}>
                  <Text style={styles.docAlertTitle}>
                    All Documents Verified
                  </Text>
                  <Text style={styles.docAlertSubtitle}>
                    Your documents are up to date
                  </Text>
                </View>
              </View>
            )}
            <View style={styles.docProgress}>
              <View
                style={[
                  styles.docProgressBar,
                  { width: `${(docStatus.verified / docStatus.total) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.docProgressText}>
              {docStatus.verified} of {docStatus.total} verified
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.menuItemLast,
                ]}
                onPress={() => router.push(item.route)}
              >
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: `${item.color}15` },
                  ]}
                >
                  <item.icon size={20} color={item.color} />
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <LogOut size={20} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
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
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
    letterSpacing: 1,
    fontWeight: "500",
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.success,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  profileId: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  tripsText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  editButton: {
    padding: 8,
    backgroundColor: Colors.primary + "15",
    borderRadius: 8,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  editText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  vehicleCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  vehicleDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  vehicleModel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  capacityBadge: {
    backgroundColor: Colors.primaryLight + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  docCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
  },
  docAlert: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  docAlertText: {
    flex: 1,
  },
  docAlertTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  docAlertSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  docProgress: {
    height: 6,
    backgroundColor: Colors.borderLight,
    borderRadius: 3,
    marginTop: 12,
    overflow: "hidden",
  },
  docProgressBar: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  docProgressText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: "right",
  },
  menuContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: Colors.errorLight,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.error,
  },
  bottomPadding: {
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
