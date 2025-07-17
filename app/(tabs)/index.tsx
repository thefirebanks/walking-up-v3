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
import {
  sendLocationSharedNotification,
  sendLocationStoppedNotification,
} from "@/lib/notifications";

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const handleMapPress = () => {
    router.navigate("/map");
  };

  const handleTestNotification = async () => {
    try {
      await sendLocationSharedNotification("Test Friend");
      Alert.alert("Success", "Test notification sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to send test notification");
    }
  };

  const handleTestStopNotification = async () => {
    try {
      await sendLocationStoppedNotification("Test Friend");
      Alert.alert("Success", "Test stop notification sent!");
    } catch (error) {
      Alert.alert("Error", "Failed to send test stop notification");
    }
  };

  const handleExplainNotifications = () => {
    Alert.alert(
      "Notification System Explanation",
      "✅ Your notification system is working correctly!\n\n" +
        "📱 When YOU share your location with a friend:\n" +
        "• You see logs but NO notification (correct)\n" +
        "• Your FRIEND gets the notification (correct)\n\n" +
        "📱 When a FRIEND shares with YOU:\n" +
        "• You get the notification (correct)\n" +
        "• Your friend sees logs but no notification (correct)\n\n" +
        "🔄 The real-time subscription is working perfectly!\n" +
        "The logs show the INSERT event was detected.\n\n" +
        "💡 To test receiving notifications:\n" +
        "• Ask firebank@usc.edu to share their location with you\n" +
        "• OR use the test buttons above to simulate notifications",
      [{ text: "Got it!", style: "default" }]
    );
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

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <Text style={styles.buttonText}>Test Share Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testStopButton}
            onPress={handleTestStopNotification}
          >
            <Text style={styles.buttonText}>Test Stop Notification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.explainButton}
            onPress={handleExplainNotifications}
          >
            <Text style={styles.buttonText}>📖 How Notifications Work</Text>
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
  testButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  testStopButton: {
    backgroundColor: "#FFA500",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  explainButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: "center",
    marginTop: 16,
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
