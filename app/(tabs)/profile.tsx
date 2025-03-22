import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLocationPing = () => {
    Alert.alert(
      "Coming Soon",
      "Location sharing will be available in the next update!"
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();

      // Show success alert with a button to continue
      Alert.alert(
        "Logged Out",
        "You have successfully logged out of your account.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate directly to the sign-in screen instead of home
              setTimeout(() => {
                router.replace("/");
              }, 100);
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert("Error signing out", error.message);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.welcomeContainer}>
          <ThemedText type="title">
            Welcome, {user?.email?.split("@")[0] || "Friend"}!
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Manage your account settings
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.cardContainer}>
          <ThemedText type="subtitle">Your Profile</ThemedText>
          <ThemedView style={styles.card}>
            <ThemedText style={styles.label}>Email:</ThemedText>
            <ThemedText>{user?.email}</ThemedText>

            <ThemedText style={[styles.label, styles.marginTop]}>
              User ID:
            </ThemedText>
            <ThemedText>{user?.id.substring(0, 8)}...</ThemedText>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                Alert.alert(
                  "Coming Soon",
                  "Profile editing will be available in the next update!"
                )
              }
            >
              <Text style={styles.buttonText}>Edit Profile</Text>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.cardContainer}>
          <ThemedText type="subtitle">Share Your Location</ThemedText>
          <ThemedView style={styles.card}>
            <ThemedText>
              Share your current location with your friends and invite them to
              join you!
            </ThemedText>
            <TouchableOpacity
              style={styles.mainButton}
              onPress={handleLocationPing}
            >
              <Text style={styles.buttonText}>Share My Location</Text>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  welcomeContainer: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  cardContainer: {
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  marginTop: {
    marginTop: 12,
  },
  button: {
    backgroundColor: "#1D3D47",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
  },
  mainButton: {
    backgroundColor: "#A1CEDC",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
