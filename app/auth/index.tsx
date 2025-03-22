import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function AuthScreen() {
  const router = useRouter();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="auto" />
      <ThemedView style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            Welcome to Walking Up v3
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Connect with friends and share your activities in real-time
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <Link href="/auth/sign-in" asChild>
            <ThemedView style={styles.button}>
              <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            </ThemedView>
          </Link>

          <Link href="/auth/sign-up" asChild>
            <ThemedView style={[styles.button, styles.secondaryButton]}>
              <ThemedText style={styles.buttonText}>Sign Up</ThemedText>
            </ThemedView>
          </Link>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#A1CEDC",
  },
  secondaryButton: {
    backgroundColor: "#1D3D47",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
