import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";

export default function SignInScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await signIn(email, password);

      if (error) {
        console.log("Sign-in error:", error);
        throw error;
      }

      // Successfully signed in, explicitly navigate to the home page
      console.log("Successfully signed in:", data?.user?.email);

      // Short delay to allow auth state to update
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    } catch (error: any) {
      console.log("Error details:", error);
      Alert.alert(
        "Error signing in",
        error.message || "Please check your credentials and try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="auto" />
      <ThemedView style={styles.innerContainer}>
        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            Sign In
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sign in to your Ping Friends account
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#AAAAAA"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Password</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#AAAAAA"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>Sign In</ThemedText>
            )}
          </TouchableOpacity>
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
    padding: 20,
  },
  backButton: {
    marginTop: 40,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#A1CEDC",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
});
