import React from "react";
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleMapPress = () => {
    router.navigate("/map");
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.logo}
        />
      </View>

      {user ? (
        // Logged in view
        <View style={styles.contentContainer}>
          <ThemedText type="title" style={styles.title}>
            Welcome, {user.email?.split("@")[0] || "Friend"}!
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Ready to explore the world with your friends?
          </ThemedText>

          <TouchableOpacity style={styles.mapButton} onPress={handleMapPress}>
            <Text style={styles.buttonText}>Open Map</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Logged out view
        <View style={styles.contentContainer}>
          <ThemedText type="title" style={styles.title}>
            Welcome to Walking Up v3
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Connect with friends and share your activities in real-time
          </ThemedText>

          <View style={styles.buttonContainer}>
            <Link href="/auth/sign-in" asChild>
              <TouchableOpacity style={styles.loginButton}>
                <Text style={styles.buttonText}>Log In</Text>
              </TouchableOpacity>
            </Link>
            <Link href="/auth/sign-in-otp" asChild>
              <TouchableOpacity style={styles.otpButton}>
                <ThemedText style={styles.buttonText}>
                  Sign In with OTP
                </ThemedText>
              </TouchableOpacity>
            </Link>

            <Link href="/auth/sign-up" asChild>
              <TouchableOpacity style={styles.signupButton}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 120,
    resizeMode: "contain",
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 40,
  },
  mapButton: {
    backgroundColor: "#A1CEDC",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 30,
  },
  loginButton: {
    backgroundColor: "#A1CEDC",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  signupButton: {
    backgroundColor: "#1D3D47",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  otpButton: {
    backgroundColor: "#FFC107",
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
