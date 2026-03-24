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
  LogOut,
  ChevronRight,
  X,
  Wallet,
  Navigation,
  Package,
  ShieldCheck,
  Gift,
  Settings,
  LayoutGrid,
} from "lucide-react-native";
import { Colors } from "@/constants/color";
import { useRouter } from "expo-router";
import { Image } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

interface SideMenuProps {
  isVisible: boolean;
  onClose: () => void;
  driverProfile?: any;
}

const SideMenu: React.FC<SideMenuProps> = ({ isVisible, onClose }) => {
  const router = useRouter();
  const { logout, user } = useAuth();
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const menuItems = [
    { icon: Home, label: "Home", route: "/(tabs)" },
    { icon: Wallet, label: "Wallet", route: "/(tabs)/earnings" },
    {
      icon: LayoutGrid,
      label: "Delivery requests",
      route: "/(tabs)/delivery-requests",
    },
    {
      icon: Navigation,
      label: "Ride requests",
      route: "/(tabs)/ride-requests",
    },
    { icon: Clock, label: "Ride History", route: "/(tabs)/ride-history" },
    { icon: User, label: "Profile", route: "/(tabs)/profile" },
    { icon: Gift, label: "Subscription", route: "/subscription" },
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
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.menuContent,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.brandSection}>
                <ShieldCheck size={20} color="#1B7A43" />
                <Text style={styles.brandText}>CID</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.brandTitleSection}>
              <Text style={styles.brandTitle}>KEKE FUNAAB</Text>
            </View>

            <View style={styles.profileCardContainer}>
              <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarInitial}>
                    {(user?.fullName || "R").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileEmail} numberOfLines={1}>
                    {user?.email || "rider@example.com"}
                  </Text>
                  <View style={styles.roleContainer}>
                    <Text style={styles.profileRole}>RIDER</Text>
                    {user?.subscription?.type === "premium" && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => handleNavigation(item.route)}
                >
                  <View style={styles.menuItemLeft}>
                    <item.icon size={22} color="#444" />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                  </View>
                  <ChevronRight size={18} color="#CCC" />
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
                <LogOut size={20} color="#D32F2F" />
                <Text style={styles.signOutText}>SIGN OUT</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  menuContent: {
    width: width * 0.75,
    height: "100%",
    backgroundColor: Colors.white,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1B7A43",
    letterSpacing: 0.5,
  },
  closeButton: {
    padding: 4,
  },
  brandTitleSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  profileCardContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2E7D32",
  },
  profileInfo: {
    flex: 1,
    gap: 1,
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111",
  },
  profileRole: {
    fontSize: 10,
    color: "#2E7D32",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  roleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  premiumBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "800",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuLabel: {
    fontSize: 14,
    color: "#111",
    fontWeight: "500",
  },
  footer: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  signOutText: {
    fontSize: 13,
    color: "#D32F2F",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default SideMenu;
