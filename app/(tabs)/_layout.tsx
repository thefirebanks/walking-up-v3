import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { Colors } from "@/constants/Colors";
import { useAuth } from "@/context/AuthContext";

/**
 * TabLayout component is responsible for generating the tab navigation layout
 * for the application. This includes setting up the tab bar, tab buttons, and
 * configuring how screens are displayed.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        tabBarStyle: {
          // Add shadow for iOS
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          // Add elevation for Android
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
          headerShown: false,
          href: user ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="friends"
        options={{
          title: "Friends",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="people" size={size} color={color} />
          ),
          headerShown: false,
          href: user ? undefined : null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-circle" size={size} color={color} />
          ),
          href: user ? undefined : null,
        }}
      />
    </Tabs>
  );
}
