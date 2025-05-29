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

  const navigateToMap = () => {
    router.navigate("/map");
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
          <ThemedText style={styles.locationInfo}>
            Go to the{" "}
            <ThemedText style={styles.mapLink} onPress={navigateToMap}>
              Map tab
            </ThemedText>{" "}
            to view friends' locations and share your own
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
          onRequestCanceled={handleRefresh}
          refreshTrigger={refreshTrigger}
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
    marginTop: -60,
    padding: 24,
    borderRadius: 12,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    textAlign: "center",
  },
  reactLogo: {
    width: 40,
    height: 40,
    position: "absolute",
  },
  locationInfo: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 8,
    textAlign: "center",
  },
  mapLink: {
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
