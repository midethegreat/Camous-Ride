import { Tabs } from "expo-router";
import {
  FontAwesome,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";
import { History, Bell } from "lucide-react-native";

import { Colors } from "@/constants/color";
import CustomHeader from "@/components/CustomHeader";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        header: ({ options, navigation }) => (
          <CustomHeader
            title={options.title}
            leftIcon={options.headerLeft ? options.headerLeft({}) : null}
            onLeftIconPress={
              options.headerLeft
                ? () => navigation.emit({ type: "headerLeftPress" })
                : undefined
            }
          />
        ),
        tabBarStyle: {
          display: "none", // Hide the bottom tab bar
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="earnings"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => (
            <MaterialIcons
              name="account-balance-wallet"
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="delivery-requests"
        options={{
          title: "Delivery",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="package-variant"
              size={24}
              color={color}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 10 }}>
              <History size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="ride-requests"
        options={{
          title: "Ride",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="car-connected"
              size={24}
              color={color}
            />
          ),
          headerLeft: () => (
            <TouchableOpacity style={{ marginLeft: 10 }}>
              <Bell size={24} color={Colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="ride-history"
        options={{
          title: "History",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="history" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
