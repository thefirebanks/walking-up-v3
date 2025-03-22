import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Text,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  useColorScheme,
} from "react-native";
import MapView, {
  Marker,
  Callout,
  PROVIDER_DEFAULT,
  UrlTile,
  MapStyleElement,
} from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons, FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { getFriends, Friend } from "@/lib/friends";
import {
  SharedLocationView,
  updateMyLocation,
  shareLocationWithFriend,
  getLocationsSharedWithMe,
  stopSharingWithFriend,
  getFriendsImSharingWith,
  getSavedUserLocation,
} from "@/lib/locations";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

// Dark mode map style
const darkMapStyle: MapStyleElement[] = [
  {
    elementType: "geometry",
    stylers: [{ color: "#212121" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#212121" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "administrative.country",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#1b1b1b" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#8a8a8a" }],
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#373737" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#3c3c3c" }],
  },
  {
    featureType: "road.highway.controlled_access",
    elementType: "geometry",
    stylers: [{ color: "#4e4e4e" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "transit",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3d3d3d" }],
  },
];

export default function MapScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userMarker, setUserMarker] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [tappedMarker, setTappedMarker] = useState<{
    latitude: number;
    longitude: number;
    type?: "user" | "selected" | "shared";
    sharedLocationData?: SharedLocationView;
  } | null>(null);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [sharedLocations, setSharedLocations] = useState<SharedLocationView[]>(
    []
  );
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [friendsImSharingWith, setFriendsImSharingWith] = useState<string[]>(
    []
  );
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Load user's location and set up a real-time subscription to location changes
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      try {
        // First, check if the user has a previously saved/shared location in the database
        // This needs to be added to the locations.ts lib file
        const savedLocation = await getSavedUserLocation();

        // Get the initial physical device location (just for awareness of where the user is)
        let deviceLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });

        // Update the device location state
        setLocation(deviceLocation);

        if (savedLocation) {
          // If the user has a previously saved location, use that as the user marker
          // but don't update the database - preserve the user's chosen location
          setUserMarker({
            latitude: savedLocation.latitude,
            longitude: savedLocation.longitude,
          });
        } else {
          // Only if the user doesn't have a saved location, use the device location
          // as the initial user marker and update the database
          setUserMarker({
            latitude: deviceLocation.coords.latitude,
            longitude: deviceLocation.coords.longitude,
          });

          // Only update the database if there's no previously saved location
          await updateMyLocation(
            deviceLocation.coords.latitude,
            deviceLocation.coords.longitude
          );
        }

        // Watch for physical device location changes (for map awareness only)
        const locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 10, // update every 10 meters
            timeInterval: 5000, // update every 5 seconds
          },
          (newLocation) => {
            // Only update the device location state (for map awareness)
            // This is just to know where the device is physically located
            setLocation(newLocation);

            // We intentionally DO NOT update the userMarker or database here
            // The user marker position should only be updated when the user
            // explicitly chooses "Set as My Location" from the map interface
          }
        );

        // Clean up the location subscription when the component unmounts
        return () => {
          locationSubscription.remove();
        };
      } catch (error) {
        console.error("Error in location setup:", error);
        setErrorMsg("Error setting up location services");
      }
    })();
  }, []);

  // Load friends and shared locations
  useEffect(() => {
    if (user) {
      loadFriends();
      loadSharedLocations();
      loadFriendsImSharingWith();

      // Set up a subscription for real-time updates
      const locationSharesSubscription = supabase
        .channel("location_shares_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "location_shares" },
          (payload) => {
            loadSharedLocations();
            loadFriendsImSharingWith();
          }
        )
        .subscribe();

      const userLocationsSubscription = supabase
        .channel("user_locations_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "user_locations" },
          (payload) => {
            loadSharedLocations();
          }
        )
        .subscribe();

      return () => {
        locationSharesSubscription.unsubscribe();
        userLocationsSubscription.unsubscribe();
      };
    }
  }, [user]);

  // Load the user's friends
  const loadFriends = async () => {
    if (!user) return;

    setLoadingFriends(true);
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error("Error loading friends:", error);
      Alert.alert("Error", "Failed to load friends list");
    } finally {
      setLoadingFriends(false);
    }
  };

  // Load locations shared with the current user
  const loadSharedLocations = async () => {
    if (!user) return;

    try {
      const locations = await getLocationsSharedWithMe();
      setSharedLocations(locations);
    } catch (error) {
      console.error("Error loading shared locations:", error);
    }
  };

  // Load the list of friends I'm sharing my location with
  const loadFriendsImSharingWith = async () => {
    if (!user) return;

    try {
      const friendIds = await getFriendsImSharingWith();
      setFriendsImSharingWith(friendIds);
    } catch (error) {
      console.error("Error loading friends I'm sharing with:", error);
    }
  };

  // Share the current location with the selected friend
  const shareLocationWithSelectedFriend = async (friend: Friend) => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to share your location");
      return;
    }

    try {
      await shareLocationWithFriend(friend.friend_id);

      Alert.alert(
        "Location Shared",
        `Your location is now being shared with ${friend.friend_name}`,
        [{ text: "OK" }]
      );

      setShowFriendsModal(false);
      loadFriendsImSharingWith();
    } catch (error) {
      console.error("Error sharing location:", error);
      Alert.alert("Error", "Failed to share location");
    }
  };

  // Stop sharing location with a friend
  const handleStopSharing = async (friendId: string) => {
    try {
      await stopSharingWithFriend(friendId);
      loadFriendsImSharingWith();
      Alert.alert("Success", "Stopped sharing your location with this friend");
    } catch (error) {
      console.error("Error stopping location sharing:", error);
      Alert.alert("Error", "Failed to stop location sharing");
    }
  };

  // Clear the tapped marker
  const clearTappedMarker = () => {
    setTappedMarker(null);
  };

  // Handle the refresh action to reload friends and shared locations
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadFriends();
      await loadSharedLocations();
      await loadFriendsImSharingWith();

      // Show success message briefly with updated info
      setRefreshSuccess(true);
      setTimeout(() => {
        setRefreshSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error during refresh:", error);
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  // Render a friend item in the modal list
  const renderFriendItem = ({ item }: { item: Friend }) => {
    const isSharing = friendsImSharingWith.includes(item.friend_id);

    return (
      <TouchableOpacity
        style={styles.friendItem}
        onPress={() => shareLocationWithSelectedFriend(item)}
      >
        <ThemedText style={styles.friendItemText}>
          {item.friend_name}
        </ThemedText>
        {isSharing && (
          <TouchableOpacity
            style={styles.stopSharingButton}
            onPress={() => handleStopSharing(item.friend_id)}
          >
            <ThemedText style={styles.stopSharingText}>Stop Sharing</ThemedText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  // Function to center the map on user's current location
  const centerOnUserLocation = async () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to use location features."
      );
      return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Location Permission Required",
          "This feature requires location permissions. Please enable location access in your device settings."
        );
        return;
      }

      // Get the current position
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Just update the local device location state - don't update userMarker
      setLocation(currentLocation);

      // Create a new region object
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.005, // Zoom in more when centering
        longitudeDelta: 0.005,
      };

      // Animate to the new region
      mapRef.current?.animateToRegion(newRegion, 1000);

      // Do NOT update the userMarker or database location
      // The userMarker should only be updated when the user explicitly
      // clicks "Set as My Location" after selecting a point on the map
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert(
        "Error",
        "Failed to get your current location. Please try again."
      );
    }
  };

  // Handle map tap to place a marker
  const handleMapPress = (event: any) => {
    // Extract the coordinates from the event
    const { coordinate } = event.nativeEvent;

    // Update the tapped marker position
    setTappedMarker({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      type: "selected",
    });

    // Check if this is the user's current location marker
    const isUserMarker =
      userMarker &&
      Math.abs(coordinate.latitude - userMarker.latitude) < 0.0000001 &&
      Math.abs(coordinate.longitude - userMarker.longitude) < 0.0000001;

    // If it's the user's marker, update the type
    if (isUserMarker) {
      setTappedMarker({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        type: "user",
      });
    }

    // Only animate to the region if it's not the user's current location marker
    if (!isUserMarker) {
      // Small delay to ensure the marker is rendered before showing callout
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(
            {
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            },
            300
          );
        }
      }, 10);
    }
  };

  // Function to show the share location modal
  const showShareLocationModal = () => {
    if (friends.length === 0) {
      Alert.alert(
        "No Friends",
        "You don't have any friends to share your location with. Add friends first.",
        [{ text: "OK" }]
      );
      return;
    }

    // First, update my location at the current marker
    if (tappedMarker) {
      updateMyLocation(
        tappedMarker.latitude,
        tappedMarker.longitude,
        "My Selected Location"
      )
        .then(() => {
          setShowFriendsModal(true);
        })
        .catch((error) => {
          console.error("Error updating location:", error);
          Alert.alert("Error", "Failed to update your location");
        });
    } else {
      Alert.alert("Error", "No location selected");
    }
  };

  // Check if user is currently sharing their location
  const isLocationBeingShared = () => {
    return friendsImSharingWith.length > 0;
  };

  // Check if the tapped marker is the user's current location
  const isTappedMarkerUserLocation = () => {
    return (
      userMarker &&
      tappedMarker &&
      (tappedMarker.type === "user" ||
        (Math.abs(tappedMarker.latitude - userMarker.latitude) < 0.0000001 &&
          Math.abs(tappedMarker.longitude - userMarker.longitude) < 0.0000001))
    );
  };

  // Function to handle stopping all location sharing
  const handleStopAllSharing = async () => {
    try {
      // Create a copy of the array since we'll be modifying it during iteration
      const friendIds = [...friendsImSharingWith];

      // Show loading indicator
      setRefreshing(true);

      // Stop sharing with each friend
      for (const friendId of friendIds) {
        await stopSharingWithFriend(friendId);
      }

      // Reload the list of friends we're sharing with
      await loadFriendsImSharingWith();

      Alert.alert("Success", "Stopped sharing your location with all friends");
    } catch (error) {
      console.error("Error stopping location sharing:", error);
      Alert.alert("Error", "Failed to stop location sharing");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <MapView
        ref={mapRef}
        style={styles.map}
        region={mapRegion}
        provider={PROVIDER_DEFAULT}
        onPress={handleMapPress}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        loadingEnabled={true}
        customMapStyle={isDarkMode ? darkMapStyle : []}
      >
        {userMarker && (
          <Marker
            coordinate={userMarker}
            title="Your Location"
            description={
              isLocationBeingShared()
                ? "Being shared with friends"
                : "This is your current location"
            }
            pinColor="#4285F4"
            onPress={() => {
              // When the user marker is pressed directly, set it as the tapped marker
              setTappedMarker({
                latitude: userMarker.latitude,
                longitude: userMarker.longitude,
                type: "user",
              });
              // No need to animate here as per user's request
            }}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerDot} />
              {isLocationBeingShared() && (
                <View style={styles.sharingIndicator}>
                  <Ionicons name="share-social" size={12} color="#fff" />
                </View>
              )}
            </View>
          </Marker>
        )}

        {tappedMarker && tappedMarker.type === "selected" && (
          <Marker
            coordinate={tappedMarker}
            title="Selected Location"
            description="Tap for options"
            pinColor="#FF6B6B"
          />
        )}

        {/* Render shared locations from friends */}
        {sharedLocations.map((location) => {
          return (
            <Marker
              key={location.sender_id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title={`${location.sender_email}'s Location`}
              description={`${
                location.location_name
              } - Last updated: ${new Date(
                location.updated_at
              ).toLocaleString()}`}
              onPress={(e) => {
                // Set as tapped marker
                setTappedMarker({
                  latitude: location.latitude,
                  longitude: location.longitude,
                  type: "shared",
                  sharedLocationData: location,
                });

                // Animate to the region for friend markers
                if (mapRef.current) {
                  mapRef.current.animateToRegion(
                    {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    },
                    300
                  );
                }
              }}
            >
              {/* Use the same style as user marker but with green color */}
              <View style={styles.friendLocationMarker}>
                <View style={styles.friendLocationMarkerDot} />
              </View>
              <Callout tooltip style={{ width: 280 }}>
                <View
                  style={[
                    styles.calloutContainer,
                    isDarkMode ? styles.darkCallout : styles.lightCallout,
                  ]}
                >
                  <ThemedText style={styles.calloutTitle}>
                    {location.sender_email}'s Location
                  </ThemedText>
                  <ThemedText style={styles.calloutText}>
                    {location.location_name}
                  </ThemedText>
                  <ThemedText style={styles.calloutText}>
                    Last updated:{" "}
                    {new Date(location.updated_at).toLocaleString()}
                  </ThemedText>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Bottom card for marker options */}
      {tappedMarker && (
        <View
          style={[
            styles.bottomCard,
            isDarkMode ? styles.darkCard : styles.lightCard,
          ]}
        >
          {tappedMarker.type === "shared" && tappedMarker.sharedLocationData ? (
            // Display shared location information
            <>
              <ThemedText style={styles.cardTitle}>
                {tappedMarker.sharedLocationData.sender_email}'s Location
              </ThemedText>
              <ThemedText style={styles.cardText}>
                {tappedMarker.sharedLocationData.location_name ||
                  "Shared Location"}
              </ThemedText>
              <ThemedText style={styles.cardText}>
                Last updated:{" "}
                {new Date(
                  tappedMarker.sharedLocationData.updated_at
                ).toLocaleString()}
              </ThemedText>
              <View style={styles.cardButtonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.calloutButtonDanger]}
                  onPress={() => clearTappedMarker()}
                >
                  <ThemedText style={styles.calloutButtonText}>
                    Close
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Display regular marker options
            <>
              <ThemedText style={styles.cardTitle}>
                Selected Location
              </ThemedText>
              <ThemedText style={styles.cardText}>
                {`Latitude: ${tappedMarker.latitude.toFixed(
                  6
                )}\nLongitude: ${tappedMarker.longitude.toFixed(6)}`}
              </ThemedText>

              {isLocationBeingShared() && isTappedMarkerUserLocation() && (
                <View style={styles.sharingStatusContainer}>
                  <Ionicons
                    name="share-social"
                    size={20}
                    color={isDarkMode ? "#00C853" : "#00C853"}
                  />
                  <ThemedText style={styles.sharingStatusText}>
                    Being shared with {friendsImSharingWith.length} friend
                    {friendsImSharingWith.length === 1 ? "" : "s"}
                  </ThemedText>
                </View>
              )}

              <View style={styles.cardButtonContainer}>
                <TouchableOpacity
                  style={[styles.cardButton, styles.calloutButtonPrimary]}
                  onPress={async () => {
                    try {
                      // Update location in the database
                      await updateMyLocation(
                        tappedMarker.latitude,
                        tappedMarker.longitude,
                        "My Selected Location"
                      );

                      // Update the userMarker state to reflect the new location
                      setUserMarker({
                        latitude: tappedMarker.latitude,
                        longitude: tappedMarker.longitude,
                      });

                      Alert.alert("Success", "Your location has been updated!");
                    } catch (error) {
                      console.error("Error updating location:", error);
                      Alert.alert("Error", "Failed to update your location");
                    }
                  }}
                >
                  <ThemedText style={styles.calloutButtonText}>
                    Set as My Location
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cardButton, styles.calloutButtonSuccess]}
                  onPress={showShareLocationModal}
                >
                  <ThemedText style={styles.calloutButtonText}>
                    Share Location
                  </ThemedText>
                </TouchableOpacity>

                {isLocationBeingShared() && isTappedMarkerUserLocation() && (
                  <TouchableOpacity
                    style={[styles.cardButton, styles.calloutButtonWarning]}
                    onPress={handleStopAllSharing}
                  >
                    <ThemedText style={styles.calloutButtonText}>
                      Stop Sharing Location
                    </ThemedText>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.cardButton, styles.calloutButtonDanger]}
                  onPress={() => clearTappedMarker()}
                >
                  <ThemedText style={styles.calloutButtonText}>
                    Deselect Marker
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Toast container - positioned absolutely at the bottom of the screen */}
      <View
        style={[
          styles.toastContainer,
          tappedMarker ? { bottom: 240 } : { bottom: 100 },
        ]}
      >
        {/* Toast message when refreshing */}
        {refreshing && (
          <View
            style={[
              styles.toast,
              isDarkMode ? styles.darkToast : styles.lightToast,
            ]}
          >
            <ThemedText style={styles.toastText}>
              Refreshing friend locations...
            </ThemedText>
          </View>
        )}

        {/* Success message toast */}
        {!refreshing && refreshSuccess && (
          <View style={[styles.toast, styles.successToast]}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#00C853"
              style={styles.successIcon}
            />
            <ThemedText style={styles.successToastText}>
              {sharedLocations.length > 0
                ? `Found ${sharedLocations.length} friend location${
                    sharedLocations.length !== 1 ? "s" : ""
                  }!`
                : "Friend locations updated!"}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Control buttons */}
      <View style={styles.controlsContainer}>
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              isDarkMode ? styles.darkControlButton : styles.lightControlButton,
            ]}
            onPress={centerOnUserLocation}
          >
            <Ionicons
              name="locate"
              size={24}
              color={isDarkMode ? "#fff" : "#000"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              isDarkMode ? styles.darkControlButton : styles.lightControlButton,
            ]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={isDarkMode ? "#fff" : "#000"}
              />
            ) : (
              <Ionicons
                name="refresh"
                size={24}
                color={isDarkMode ? "#fff" : "#000"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Friends selection modal */}
      <Modal
        visible={showFriendsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFriendsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.modalContent,
              isDarkMode ? styles.darkModalContent : styles.lightModalContent,
            ]}
          >
            <ThemedText style={styles.modalTitle}>
              Share Your Location
            </ThemedText>

            {isLocationBeingShared() && (
              <View style={styles.currentSharingContainer}>
                <ThemedText style={styles.currentSharingTitle}>
                  Currently sharing with:
                </ThemedText>
                {friends
                  .filter((friend) =>
                    friendsImSharingWith.includes(friend.friend_id)
                  )
                  .map((friend) => (
                    <View
                      key={friend.friend_id}
                      style={styles.currentSharingItem}
                    >
                      <ThemedText style={styles.currentSharingName}>
                        {friend.friend_name}
                      </ThemedText>
                      <TouchableOpacity
                        style={styles.stopSharingButton}
                        onPress={() => handleStopSharing(friend.friend_id)}
                      >
                        <ThemedText style={styles.stopSharingText}>
                          Stop
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  ))}
                <TouchableOpacity
                  style={styles.stopAllSharingButton}
                  onPress={handleStopAllSharing}
                >
                  <ThemedText style={styles.stopSharingText}>
                    Stop Sharing With All
                  </ThemedText>
                </TouchableOpacity>
              </View>
            )}

            <ThemedText style={styles.modalSubtitle}>
              Choose friends to share your current location with:
            </ThemedText>

            {loadingFriends ? (
              <ActivityIndicator
                size="large"
                color={isDarkMode ? "#A1CEDC" : "#1D3D47"}
                style={{ marginVertical: 20 }}
              />
            ) : friends.length > 0 ? (
              <FlatList
                data={friends}
                renderItem={renderFriendItem}
                keyExtractor={(item) => item.friend_id}
                contentContainerStyle={styles.friendsList}
              />
            ) : (
              <ThemedText style={styles.noFriendsText}>
                You don't have any friends yet. Add friends from the Friends
                tab.
              </ThemedText>
            )}

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowFriendsModal(false)}
            >
              <ThemedText style={styles.closeModalButtonText}>Close</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  controlButtons: {
    flexDirection: "column",
    alignItems: "center",
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkControlButton: {
    backgroundColor: "#333",
  },
  lightControlButton: {
    backgroundColor: "#fff",
  },
  refreshIndicator: {
    position: "absolute",
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(66, 133, 244, 0.3)",
    borderWidth: 2,
    borderColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
  },
  userMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4285F4",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    maxHeight: "70%",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: "#222",
  },
  lightModalContent: {
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  friendsList: {
    paddingVertical: 10,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  friendItemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  stopSharingButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  stopSharingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  noFriendsText: {
    marginVertical: 20,
    textAlign: "center",
  },
  closeModalButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 5,
    backgroundColor: "#1D3D47",
    alignItems: "center",
  },
  closeModalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  calloutContainer: {
    width: 250,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 7, // Add space for the arrow
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  calloutText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  calloutButtonContainer: {
    marginTop: 10,
    gap: 8,
  },
  calloutButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  calloutButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  calloutButtonPrimary: {
    backgroundColor: "#4285F4",
  },
  calloutButtonSecondary: {
    backgroundColor: "#FF6B6B",
  },
  calloutButtonDanger: {
    backgroundColor: "#FF6B6B",
  },
  calloutButtonSuccess: {
    backgroundColor: "#00C853",
  },
  darkCallout: {
    backgroundColor: "#222",
    borderColor: "rgba(255,255,255,0.1)",
  },
  lightCallout: {
    backgroundColor: "#fff",
    borderColor: "rgba(0,0,0,0.1)",
  },
  bottomCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
    margin: 0,
  },
  darkCard: {
    backgroundColor: "#222",
  },
  lightCard: {
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: "center",
  },
  cardButtonContainer: {
    marginTop: 15,
    gap: 10,
  },
  cardButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  friendLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0, 200, 83, 0.3)",
    borderWidth: 2,
    borderColor: "#00C853",
    justifyContent: "center",
    alignItems: "center",
  },
  friendLocationMarkerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00C853",
  },
  sharingStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: "rgba(0, 200, 83, 0.1)",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 200, 83, 0.3)",
  },
  sharingStatusText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    color: "#00C853",
  },
  calloutButtonWarning: {
    backgroundColor: "#FF9800",
  },
  sharingIndicator: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#00C853",
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  currentSharingContainer: {
    marginBottom: 20,
  },
  currentSharingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  currentSharingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  currentSharingName: {
    fontSize: 14,
    fontWeight: "500",
  },
  stopAllSharingButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
    backgroundColor: "#FF6B6B",
  },
  toastContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  toast: {
    width: 220,
    padding: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  darkToast: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  lightToast: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  toastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  successToast: {
    backgroundColor: "rgba(0, 200, 83, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(0, 200, 83, 0.5)",
  },
  successIcon: {
    marginRight: 5,
  },
  successToastText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
