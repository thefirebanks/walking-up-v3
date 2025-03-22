import React, { useState } from "react";
import { StyleSheet, Platform, View, Image } from "react-native";
import { useRouter } from "expo-router";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import AddFriend from "@/components/AddFriend";
import FriendRequests from "@/components/FriendRequests";
import OutgoingFriendRequests from "@/components/OutgoingFriendRequests";
import FriendsList from "@/components/FriendsList";

export default function FriendsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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
          <ThemedText type="title">My Friends</ThemedText>
          <ThemedText style={styles.subtitle}>
            Connect with friends and share your location
          </ThemedText>
        </ThemedView>

        {/* Add Friends Component */}
        <AddFriend onFriendAdded={handleRefresh} />

        {/* Friend Requests Component */}
        <FriendRequests
          onRequestHandled={handleRefresh}
          refreshTrigger={refreshTrigger}
        />

        {/* Outgoing Friend Requests Component */}
        <OutgoingFriendRequests
          refreshTrigger={refreshTrigger}
          onRequestCanceled={handleRefresh}
        />

        {/* Friends List Component */}
        <FriendsList refreshTrigger={refreshTrigger} />
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
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
