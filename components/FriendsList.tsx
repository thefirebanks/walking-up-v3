import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  Alert,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { ThemedView } from "./ThemedView";
import { ThemedText } from "./ThemedText";
import { getFriends, Friend } from "@/lib/friends";

type FriendsListProps = {
  refreshTrigger?: number;
};

export default function FriendsList({ refreshTrigger = 0 }: FriendsListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFriends();
  }, [refreshTrigger]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert("Error", "Failed to load friends list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFriend = (item: Friend) => {
    return (
      <ThemedView key={item.friend_id} style={styles.friendItem}>
        <View style={styles.friendInfo}>
          <ThemedText style={styles.nameText}>{item.friend_name}</ThemedText>
        </View>

        <TouchableOpacity
          style={styles.pingButton}
          onPress={() => {
            Alert.alert(
              "Coming Soon",
              "Location sharing with friends will be available in the next update!"
            );
          }}
        >
          <Text style={styles.buttonText}>Ping</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">My Friends</ThemedText>
      <ThemedView style={styles.listContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#1D3D47"
            style={styles.loader}
          />
        ) : friends.length === 0 ? (
          <ThemedText style={styles.emptyText}>
            You haven't added any friends yet. Start by adding friends using
            their email address.
          </ThemedText>
        ) : (
          <View style={styles.listContent}>
            {friends.map((item) => renderFriend(item))}
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
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
    marginBottom: 8,
  },
  friendInfo: {
    flex: 1,
  },
  nameText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  pingButton: {
    backgroundColor: "#A1CEDC",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
