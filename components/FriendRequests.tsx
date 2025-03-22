import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  View,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import {
  getPendingFriendRequests,
  updateFriendshipStatus,
  FriendRequest,
} from "@/lib/friends";

type FriendRequestsProps = {
  onRequestHandled?: () => void;
  refreshTrigger?: number;
};

export default function FriendRequests({
  onRequestHandled,
  refreshTrigger = 0,
}: FriendRequestsProps) {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadFriendRequests();
  }, [refreshTrigger]);

  const loadFriendRequests = async () => {
    setLoading(true);
    try {
      const pendingRequests = await getPendingFriendRequests();
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Error loading friend requests:", error);
      Alert.alert("Error", "Failed to load friend requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (requestorId: string, accept: boolean) => {
    setProcessingId(requestorId);
    try {
      const success = await updateFriendshipStatus(
        requestorId,
        accept ? "accepted" : "rejected"
      );

      if (success) {
        // Update the local state to remove the handled request
        setRequests((prev) =>
          prev.filter((req) => req.requestor_id !== requestorId)
        );

        if (accept) {
          Alert.alert("Success", "Friend request accepted!");
        }

        if (onRequestHandled) {
          onRequestHandled();
        }
      } else {
        Alert.alert(
          "Error",
          `Failed to ${
            accept ? "accept" : "reject"
          } friend request. Please try again.`
        );
      }
    } catch (error) {
      console.error("Error handling friend request:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  const renderFriendRequest = (item: FriendRequest) => {
    const isProcessing = processingId === item.requestor_id;

    return (
      <ThemedView key={item.requestor_id} style={styles.requestItem}>
        <View style={styles.requestInfo}>
          <ThemedText style={styles.nameText}>{item.requestor_name}</ThemedText>
          <ThemedText style={styles.dateText}>
            Requested on {new Date(item.request_date).toLocaleDateString()}
          </ThemedText>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleRequest(item.requestor_id, true)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.buttonText}>Accept</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRequest(item.requestor_id, false)}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>Ignore</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Friend Requests</ThemedText>
      <ThemedView style={styles.listContainer}>
        {loading && requests.length === 0 ? (
          <ActivityIndicator
            size="large"
            color="#1D3D47"
            style={styles.loader}
          />
        ) : requests.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            No pending friend requests.
          </ThemedText>
        ) : (
          <View style={styles.listContent}>
            {requests.map((item) => renderFriendRequest(item))}
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
  emptyText: {
    textAlign: "center",
    marginVertical: 20,
  },
  listContent: {
    paddingBottom: 8,
  },
  requestItem: {
    flexDirection: "column",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 8,
  },
  requestInfo: {
    marginBottom: 12,
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  rejectButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
