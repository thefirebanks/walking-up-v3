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
import Ionicons from "@expo/vector-icons/Ionicons";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";

export default function OtpSignInScreen() {
  const router = useRouter();
  const { signInWithOtp, verifyOtp } = useAuth();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const { error } = await signInWithOtp(email);

      if (error) {
        throw error;
      }

      setOtpSent(true);
      Alert.alert(
        "OTP Sent",
        "Please check your email for the one-time password"
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP code");
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await verifyOtp(email, otp);

      if (error) {
        throw error;
      }

      console.log("Successfully signed in with OTP:", data?.user?.email);

      // Navigate to home after successful authentication
      setTimeout(() => {
        router.replace("/(tabs)");
      }, 100);
    } catch (error: any) {
      Alert.alert(
        "Invalid OTP",
        error.message || "Please check your code and try again"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="auto" />
      <ThemedView style={styles.innerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Ionicons name="arrow-back" size={30} color="#A1CEDC" />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <ThemedText type="title" style={styles.title}>
            Sign In with OTP
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {otpSent
              ? "Enter the code sent to your email"
              : "Enter your email to receive a one-time password"}
          </ThemedText>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[styles.input, otpSent && styles.disabledInput]}
              placeholder="Enter your email"
              //   placeholderTextColor="#AAAAAA"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!otpSent}
            />
          </View>

          {otpSent && (
            <View style={styles.inputContainer}>
              <ThemedText style={styles.label}>OTP Code</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                placeholderTextColor="#AAAAAA"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={otpSent ? handleVerifyOtp : handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {otpSent ? "Verify OTP" : "Send OTP"}
              </ThemedText>
            )}
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleResendOtp}
              disabled={loading}
            >
              <ThemedText style={styles.secondaryButtonText}>
                Resend OTP
              </ThemedText>
            </TouchableOpacity>
          )}
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
    marginBottom: 15,
    alignSelf: "flex-start",
    padding: 5,
  },
  headerContainer: {
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
  disabledInput: {
    backgroundColor: "#f5f5f5",
    opacity: 0.7,
    color: "#303030",
    borderColor: "#cccccc",
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#A1CEDC",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A1CEDC",
  },
});
