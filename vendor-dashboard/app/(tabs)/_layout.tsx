import { Tabs, Redirect } from "expo-router";
import { View, Text } from "react-native";
import {
  Home,
  Package,
  ShoppingCart,
  MessageCircle,
  BarChart3,
} from "lucide-react-native";
import { Colors } from "../../constants/Colors";

function TabIcon({ icon: Icon, focused, color }: any) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Icon size={24} color={color} />
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.vendorPrimary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Home} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={Package} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={ShoppingCart} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={MessageCircle} focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon icon={BarChart3} focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
