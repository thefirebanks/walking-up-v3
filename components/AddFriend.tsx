import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import {
  findUserByEmail,
  sendFriendRequest,
  checkFriendshipStatus,
} from "@/lib/friends";

type AddFriendProps = {
  onFriendAdded?: () => void;
};

export default function AddFriend({ onFriendAdded }: AddFriendProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      // Search for user by email
      const user = await findUserByEmail(email);

      if (!user) {
        Alert.alert("User Not Found", "No user found with this email address.");
        return;
      }

      // Check if a friendship already exists
      const status = await checkFriendshipStatus(user.id);

      if (status) {
        let message = "";
        switch (status) {
          case "pending":
            message = "A friend request is already pending with this user.";
            break;
          case "accepted":
            message = "This user is already your friend.";
            break;
          case "rejected":
            message = "This user has previously rejected your friend request.";
            break;
        }
        Alert.alert("Friend Request Status", message);
        return;
      }

      // Send friend request
      const success = await sendFriendRequest(user.id);

      if (success) {
        Alert.alert(
          "Friend Request Sent",
          `A friend request has been sent to ${user.full_name || user.email}.`
        );
        setEmail("");
        if (onFriendAdded) onFriendAdded();
      } else {
        Alert.alert(
          "Error",
          "Failed to send friend request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Add Friend by Email</ThemedText>
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter email address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendRequest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Send Request</Text>
          )}
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "white",
    color: "#333",
  },
  button: {
    backgroundColor: "#1D3D47",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
