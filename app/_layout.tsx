import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import React from "react";
import "react-native-reanimated";
import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Root layout without auth
function RootLayoutNav() {
  const { loading } = useAuth();
  const colorScheme = useColorScheme();
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Listen for notifications when app is in foreground
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const { title, body } = notification.request.content;

        // Show an alert for location sharing notifications
        if (notification.request.content.data?.type === "location_shared") {
          Alert.alert(
            title || "New Notification",
            body || "You have a new notification"
          );
        }
      });

    // Listen for user tapping on notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const notificationData = response.notification.request.content.data;

        if (notificationData?.type === "location_shared") {
          // Here you could navigate to the map screen or perform other actions
          console.log("User tapped on location sharing notification");
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // If auth is still loading, render nothing (keeps splash screen)
  if (loading) return null;

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/sign-in-otp"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

// Main layout component that wraps everything with AuthProvider
export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
