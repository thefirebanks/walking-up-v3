import React from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import { useAuth } from "@/context/AuthContext";

export function ProfileButton() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Navigation will happen automatically through _layout.tsx
    } catch (error: any) {
      Alert.alert("Error signing out", error.message);
    }
  };

  if (!user) return null;

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity onPress={handleSignOut}>
        <ThemedText style={styles.text}>Sign Out</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#A1CEDC",
  },
  text: {
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
