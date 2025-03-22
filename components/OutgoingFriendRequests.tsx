import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  View,
  ScrollView,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import {
  getOutgoingFriendRequests,
  cancelFriendRequest,
  OutgoingFriendRequest,
} from "@/lib/friends";

type OutgoingFriendRequestsProps = {
  refreshTrigger?: number;
  onRequestCanceled?: () => void;
};

export default function OutgoingFriendRequests({
  refreshTrigger = 0,
  onRequestCanceled,
}: OutgoingFriendRequestsProps) {
  const [requests, setRequests] = useState<OutgoingFriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadOutgoingRequests();
  }, [refreshTrigger]);

  const loadOutgoingRequests = async () => {
    setLoading(true);
    try {
      const outgoingRequests = await getOutgoingFriendRequests();
      setRequests(outgoingRequests);
    } catch (error) {
      console.error("Error loading outgoing friend requests:", error);
      Alert.alert(
        "Error",
        "Failed to load outgoing friend requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (recipientId: string) => {
    setProcessingId(recipientId);
    try {
      const success = await cancelFriendRequest(recipientId);

      if (success) {
        // Update the local state to remove the canceled request
        setRequests((prev) =>
          prev.filter((req) => req.recipient_id !== recipientId)
        );
        Alert.alert("Success", "Friend request canceled.");

        if (onRequestCanceled) {
          onRequestCanceled();
        }
      } else {
        Alert.alert(
          "Error",
          "Failed to cancel friend request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error canceling friend request:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const renderOutgoingRequest = (item: OutgoingFriendRequest) => {
    const isProcessing = processingId === item.recipient_id;

    return (
      <ThemedView key={item.recipient_id} style={styles.requestItem}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.nameText}>{item.recipient_name}</ThemedText>
          <ThemedText style={styles.dateText}>
            Sent on {new Date(item.request_date).toLocaleDateString()}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelRequest(item.recipient_id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Cancel</Text>
          )}
        </TouchableOpacity>
      </ThemedView>
    );
  };

  // If no outgoing requests, we don't need to render this component
  if (!loading && requests.length === 0) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Outgoing Friend Requests</ThemedText>
      <ThemedView style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1D3D47"
            style={styles.loader}
          />
        ) : (
          <View style={styles.listContent}>
            {requests.map((item) => renderOutgoingRequest(item))}
          </View>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  listContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    minHeight: 100,
  },
  loader: {
    marginVertical: 20,
  },
  listContent: {
    paddingBottom: 8,
  },
  requestItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 8,
  },
  requestInfo: {
    flex: 1,
  },
  nameText: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  cancelButton: {
    backgroundColor: "#F44336",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
