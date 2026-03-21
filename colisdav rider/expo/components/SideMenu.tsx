import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Home,
  User,
  Clock,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  X,
  BadgeCheck,
  Wallet,
  Navigation,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { DriverProfile } from "@/services/riderApi";
import { useAuth } from "@/contexts/AuthContext";

const { width } = Dimensions.get("window");

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  driverProfile?: DriverProfile | null;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isVisible,
  onClose,
  driverProfile,
}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Slow expansion from the left
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const menuItems = [
    { icon: Home, label: "Home", route: "/(tabs)" },
    { icon: Wallet, label: "Wallet (Earnings)", route: "/(tabs)/earnings" },
    { icon: Navigation, label: "Ride requests", route: "/ride-requests" },
    { icon: Clock, label: "Ride History", route: "/(tabs)/activity" },
    { icon: User, label: "Profile", route: "/(tabs)/profile" },
  ];

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      onRequestClose={onClose}
      animationType="none"
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
        </TouchableWithoutFeedback>

        {/* Menu Content */}
        <Animated.View
          style={[
            styles.menuContent,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.profileFrame}>
                <Image
                  source={{
                    uri:
                      driverProfile?.avatar ||
                      "https://via.placeholder.com/100",
                  }}
                  style={styles.profileAvatar}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {driverProfile?.name || "Driver"}
                  </Text>
                  <View style={styles.verifyBadge}>
                    <BadgeCheck
                      size={14}
                      color={Colors.primary}
                      fill={Colors.primary + "20"}
                    />
                    <Text style={styles.verifyText}>Verified Driver</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.iconContainer}>
                      <item.icon size={22} color={Colors.primary} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <ChevronRight size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={() => {
                  onClose();
                  logout();
                }}
              >
                <LogOut size={20} color={Colors.error} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  menuContent: {
    width: width * 0.8,
    height: "100%",
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.white,
  },
  profileFrame: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.borderLight,
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  verifyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verifyText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14, // Reduced from 18
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // Reduced from 16
  },
  iconContainer: {
    width: 32, // Reduced from 40
    height: 32, // Reduced from 40
    borderRadius: 8,
    backgroundColor: Colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
  },
  menuLabel: {
    fontSize: 13, // Reduced from 14
    color: Colors.text,
    fontWeight: "600",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingVertical: 20,
    backgroundColor: Colors.background,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: "600",
  },
});

export default SideMenu;
