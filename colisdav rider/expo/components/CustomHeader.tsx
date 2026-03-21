import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Menu, ChevronRight } from "lucide-react-native";
import { Colors } from "@/constants/color";
import SideMenu from "./SideMenu";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CustomHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title = "Colisdav",
  showBackButton = false,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleMenuPress = () => {
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  return (
    <>
      <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          {showBackButton ? (
            <TouchableOpacity style={styles.iconButton} onPress={onBackPress}>
              <ChevronRight
                size={24}
                color={Colors.text}
                style={styles.backIcon}
              />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleMenuPress}
            >
              <Menu size={24} color={Colors.text} />
            </TouchableOpacity>
          )}

          <Text style={styles.headerTitle}>{title}</Text>

          <View style={styles.rightSpacer} />
        </View>
      </View>

      <SideMenu isVisible={isDrawerVisible} onClose={handleCloseDrawer} />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 56,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primary + "15",
  },
  backIcon: {
    transform: [{ rotate: "180deg" }],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    flex: 1,
  },
  rightSpacer: {
    width: 40,
  },
});

export default CustomHeader;
