import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useNotifications } from "@/providers/NotificationProvider";
import { BellDot, Bell, CheckCheck, Trash2 } from "lucide-react-native";
import {
  GestureHandlerRootView,
  Swipeable,
  LongPressGestureHandler,
  State,
} from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

const NotificationsScreen = () => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    restoreDeletedNotifications,
    clearAllNotifications,
  } = useNotifications();
  console.log("Notifications on screen:", notifications);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<
    Set<string>
  >(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const router = useRouter();
  const swipeableRefs = useRef<Map<string, any>>(new Map());

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  }, [fetchNotifications]);

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    // Close swipeable after deletion
    const swipeable = swipeableRefs.current.get(id);
    if (swipeable) {
      swipeable.close();
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedNotifications.size === 0) return;

    Alert.alert(
      "Delete Notifications",
      `Are you sure you want to delete ${selectedNotifications.size} notification(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Delete all selected notifications
            const deletePromises = Array.from(selectedNotifications).map((id) =>
              deleteNotification(id),
            );
            await Promise.all(deletePromises);

            // Exit selection mode
            setSelectedNotifications(new Set());
            setIsSelectionMode(false);
          },
        },
      ],
    );
  };

  const handleRestoreDeleted = async () => {
    await restoreDeletedNotifications();
    Alert.alert("Success", "Deleted notifications have been restored.");
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to permanently clear all notifications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await clearAllNotifications();
            setSelectedNotifications(new Set());
            setIsSelectionMode(false);
          },
        },
      ],
    );
  };

  const handleLongPress = (notification: NotificationItem) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedNotifications(new Set([notification.id]));
    }
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    if (isSelectionMode) {
      // Toggle selection
      const newSelected = new Set(selectedNotifications);
      if (newSelected.has(notification.id)) {
        newSelected.delete(notification.id);
        if (newSelected.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSelected.add(notification.id);
      }
      setSelectedNotifications(newSelected);
    } else {
      // Normal behavior - mark as read
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    }
  };

  const exitSelectionMode = () => {
    setSelectedNotifications(new Set());
    setIsSelectionMode(false);
  };

  const renderRightActions = (notificationId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteSwipeButton}
        onPress={() => handleDelete(notificationId)}
        activeOpacity={0.8}
      >
        <Trash2 color={Colors.white} size={24} />
        <Text style={styles.deleteSwipeText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const isSelected = selectedNotifications.has(item.id);

    return (
      <LongPressGestureHandler
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === State.ACTIVE) {
            handleLongPress(item);
          }
        }}
        minDurationMs={500}
      >
        <Animated.View>
          <Swipeable
            ref={(ref) => {
              if (ref) {
                swipeableRefs.current.set(item.id, ref);
              } else {
                swipeableRefs.current.delete(item.id);
              }
            }}
            renderRightActions={() => renderRightActions(item.id)}
            enabled={!isSelectionMode}
            onSwipeableOpen={() => {
              // Close other swipeables when one opens
              swipeableRefs.current.forEach((ref, id) => {
                if (id !== item.id && ref) {
                  ref.close();
                }
              });
            }}
          >
            <TouchableOpacity
              style={[
                styles.notificationItem,
                !item.isRead && styles.unreadItem,
                isSelected && styles.selectedItem,
                isSelectionMode && styles.selectionModeItem,
              ]}
              onPress={() => handleNotificationPress(item)}
              activeOpacity={0.7}
              disabled={isSelectionMode && false} // Keep enabled in selection mode
            >
              <View style={styles.mainContent}>
                <View style={styles.iconWrapper}>
                  {!item.isRead ? (
                    <BellDot color={Colors.primary} size={26} />
                  ) : (
                    <Bell color={Colors.gray} size={26} />
                  )}
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.message}>{item.message}</Text>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleString()}
                  </Text>
                </View>
                {isSelectionMode && (
                  <View
                    style={[
                      styles.selectionIndicator,
                      isSelected && styles.selectionIndicatorSelected,
                    ]}
                  >
                    {isSelected && (
                      <FontAwesome
                        name="check"
                        size={16}
                        color={Colors.white}
                      />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Swipeable>
        </Animated.View>
      </LongPressGestureHandler>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity
          onPress={isSelectionMode ? exitSelectionMode : () => router.back()}
          style={styles.backButton}
        >
          <FontAwesome
            name={isSelectionMode ? "times" : "arrow-left"}
            size={24}
            color="#333"
          />
        </TouchableOpacity>
        <Text style={styles.header}>
          {isSelectionMode
            ? `${selectedNotifications.size} selected`
            : "Notifications"}
        </Text>
        {isSelectionMode ? (
          <TouchableOpacity
            onPress={handleDeleteMultiple}
            style={styles.deleteAllButton}
            disabled={selectedNotifications.size === 0}
          >
            <Trash2
              size={22}
              color={selectedNotifications.size > 0 ? Colors.red : Colors.gray}
            />
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={styles.markAllButton}
            >
              <CheckCheck size={22} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => {
                Alert.alert("Notification Options", "Choose an action:", [
                  { text: "Restore Deleted", onPress: handleRestoreDeleted },
                  {
                    text: "Clear All",
                    onPress: handleClearAll,
                    style: "destructive",
                  },
                  { text: "Cancel", style: "cancel" },
                ]);
              }}
            >
              <FontAwesome name="ellipsis-v" size={20} color={Colors.dark} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Bell size={48} color={Colors.lightGray} />
          <Text style={styles.emptyText}>No notifications yet.</Text>
          <Text style={styles.emptySubText}>
            We&apos;ll let you know when something important happens.
          </Text>
          <Text style={styles.emptyInfo}>
            Notifications are saved locally and won&apos;t disappear
            automatically.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.dark,
  },
  markAllButton: {
    padding: 5,
  },
  listContainer: {
    paddingVertical: 8,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    overflow: "hidden",
  },
  unreadItem: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  deleteButton: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  deleteSwipeButton: {
    backgroundColor: Colors.red || "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginVertical: 6,
  },
  deleteSwipeText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  deleteAllButton: {
    padding: 5,
  },
  selectedItem: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  selectionModeItem: {
    // Add subtle animation or visual cue for selection mode
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  selectionIndicatorSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  iconWrapper: {
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: Colors.lightGray,
    marginTop: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.darkGray,
    marginTop: 16,
    emptySubText: {
      fontSize: 14,
      color: Colors.gray,
      textAlign: "center",
    },
    emptyInfo: {
      fontSize: 12,
      color: Colors.gray,
      marginTop: 8,
      textAlign: "center",
      lineHeight: 18,
      opacity: 0.8,
    },
    marginTop: 8,
  },
});

export default NotificationsScreen;
