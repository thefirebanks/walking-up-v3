import { Tabs, Redirect } from "expo-router";
import React from "react";

import Ionicons from "@expo/vector-icons/Ionicons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Show tab bar only for authenticated users
        tabBarStyle: user ? undefined : { display: "none" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "home-sharp" : "home-outline"}
              color={color}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              color={color}
              size={24}
            />
          ),
        }}
        // Redirect to sign-in if trying to access profile while not authenticated
        redirect={!user}
      />
    </Tabs>
  );
}
