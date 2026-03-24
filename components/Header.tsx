import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu, Bell, ArrowLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useNotifications } from "@/providers/NotificationProvider";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onMenuPress?: () => void;
  onNotificationsPress?: () => void;
  onBackPress?: () => void;
}

export default function Header({
  title,
  subtitle,
  showBackButton = false,
  onMenuPress,
  onNotificationsPress,
  onBackPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notifications } = useNotifications();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleNotifications = () => {
    if (onNotificationsPress) {
      onNotificationsPress();
    } else {
      router.push("/notifications" as never);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity style={styles.button} onPress={handleBackPress}>
            <ArrowLeft size={22} color={Colors.dark} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={onMenuPress}>
            <Menu size={22} color={Colors.dark} />
          </TouchableOpacity>
        )}
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSub}>{subtitle}</Text>}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNotifications}>
          <Bell size={22} color={Colors.dark} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: Colors.red,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.white,
    paddingHorizontal: 2,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: "800",
  },
  headerCenter: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: "600",
    color: Colors.gray,
    letterSpacing: 0.8,
    marginTop: 1,
    textTransform: "uppercase",
  },
});
