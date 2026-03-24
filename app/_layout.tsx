import React, { useEffect, useState } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { CartProvider } from "@/providers/CartProvider";
import { API_URL } from "@/constants/apiConfig";
import ErrorBoundary from "@/components/ErrorBoundary";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const PUBLIC_ROUTES = [
  "welcome",
  "login",
  "onboarding",
  "guest-onboarding",
  "guest-login",
  "role-select",
];

function RootLayoutNav() {
  const { isAuthenticated, isLoading, guestAuth } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    setIsRouterReady(true);
  }, []);

  useEffect(() => {
    if (isLoading || !isRouterReady) return;

    const checkAndRoute = async () => {
      const currentRoute = segments[0] as string | undefined;
      let guestAuthFresh = guestAuth;
      try {
        const v = await AsyncStorage.getItem("cid_guest_auth");
        guestAuthFresh = v === "true";
      } catch {
        // ignore
      }

      if (isAuthenticated || guestAuthFresh) {
        // If authenticated, redirect away from welcome/login/onboarding
        if (
          currentRoute === "welcome" ||
          currentRoute === "login" ||
          currentRoute === "onboarding" ||
          currentRoute === "guest-onboarding"
        ) {
          router.replace("/" as never);
          return;
        }
      } else {
        // If not authenticated, ensure they are on a public route or redirect to welcome
        const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute ?? "");
        if (!isPublicRoute) {
          router.replace("/welcome" as never);
          return;
        }
      }
    };
    checkAndRoute();
  }, [isAuthenticated, guestAuth, isLoading, isRouterReady]);

  useEffect(() => {
    if (!isLoading && guestAuth !== null) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, guestAuth]);

  if (!isRouterReady) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="bank" options={{ presentation: "card" }} />
      <Stack.Screen name="rides" options={{ presentation: "card" }} />
      <Stack.Screen name="wallet" options={{ presentation: "card" }} />
      <Stack.Screen name="profile" options={{ presentation: "card" }} />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="role-select" options={{ presentation: "card" }} />
      <Stack.Screen
        name="guest-onboarding"
        options={{ presentation: "card" }}
      />
      <Stack.Screen name="guest-login" options={{ presentation: "card" }} />
      <Stack.Screen name="login" options={{ presentation: "card" }} />
      <Stack.Screen name="onboarding" options={{ presentation: "card" }} />
      <Stack.Screen name="booking-confirm" options={{ presentation: "card" }} />
      <Stack.Screen name="ride-history" options={{ presentation: "card" }} />
      <Stack.Screen name="activity" options={{ presentation: "card" }} />
      <Stack.Screen name="personal-info" options={{ presentation: "card" }} />
      <Stack.Screen name="verify-kyc" options={{ presentation: "card" }} />
      <Stack.Screen name="chat" options={{ presentation: "card" }} />
      <Stack.Screen name="support" options={{ presentation: "card" }} />
      <Stack.Screen name="support-hub" options={{ presentation: "card" }} />
      <Stack.Screen name="services" options={{ presentation: "card" }} />
      <Stack.Screen name="rewards" options={{ presentation: "card" }} />
      <Stack.Screen name="crypto-deposit" options={{ presentation: "card" }} />
      <Stack.Screen name="pin-settings" options={{ presentation: "card" }} />
      <Stack.Screen name="receipt" options={{ presentation: "modal" }} />
      <Stack.Screen name="notifications" options={{ presentation: "card" }} />
      <Stack.Screen name="checkout" options={{ presentation: "card" }} />
      <Stack.Screen name="rider-assignment" options={{ presentation: "card" }} />
      <Stack.Screen name="live-tracking" options={{ presentation: "card" }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <NotificationProvider api_url={API_URL}>
            <CartProvider>
              <ErrorBoundary>
                <RootLayoutNav />
              </ErrorBoundary>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
