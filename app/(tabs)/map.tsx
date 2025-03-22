import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  Text,
} from "react-native";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  UrlTile,
  MapStyleElement,
} from "react-native-maps";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { useAuth } from "@/context/AuthContext";

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
  } | null>(null);

  // Default to a central location (will be overridden by user location when available)
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    // Function to request location permissions and get initial location
    const getLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        // Get the current position
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation(currentLocation);

        // Update map region based on user's location
        const newRegion = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setMapRegion(newRegion);
        setUserMarker({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        setErrorMsg("Error getting location. Please try again.");
      }
    };

    // Only try to get location if the user is logged in
    if (user) {
      getLocationPermission();
    }
  }, [user]);

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

      setLocation(currentLocation);

      // Create the new region object
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.005, // Zoom in more when centering
        longitudeDelta: 0.005,
      };

      // Update the marker
      setUserMarker({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      // Animate to the new region
      mapRef.current?.animateToRegion(newRegion, 1000);
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
    });
  };

  // Clear the tapped marker
  const clearTappedMarker = () => {
    setTappedMarker(null);
  };

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        customMapStyle={isDarkMode ? darkMapStyle : undefined}
        onPress={handleMapPress}
      >
        {/* Tile overlay - use dark tiles for dark mode, standard tiles for light mode */}
        <UrlTile
          urlTemplate={
            isDarkMode
              ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
              : "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          maximumZ={19}
          flipY={false}
        />

        {/* User's current location marker */}
        {userMarker && (
          <Marker
            coordinate={userMarker}
            title="You are here"
            description="Your current location"
            pinColor={isDarkMode ? "#A1CEDC" : "#1D3D47"}
          />
        )}

        {/* Tapped location marker */}
        {tappedMarker && (
          <Marker
            coordinate={tappedMarker}
            title="Selected Location"
            description="Tap to interact with this location"
            pinColor="#FF6B6B"
            onCalloutPress={() => {
              Alert.alert(
                "Location Selected",
                "What would you like to do with this location?",
                [
                  {
                    text: "Share Location",
                    onPress: () =>
                      Alert.alert(
                        "Coming Soon",
                        "Location sharing will be available soon!"
                      ),
                  },
                  {
                    text: "Navigate Here",
                    onPress: () =>
                      Alert.alert(
                        "Coming Soon",
                        "Navigation will be available soon!"
                      ),
                  },
                  {
                    text: "Clear Marker",
                    onPress: clearTappedMarker,
                    style: "destructive",
                  },
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                ]
              );
            }}
          />
        )}
      </MapView>

      {/* Current location button */}
      <TouchableOpacity
        style={[
          styles.currentLocationButton,
          isDarkMode ? styles.darkLocationButton : styles.lightLocationButton,
        ]}
        onPress={centerOnUserLocation}
      >
        <Ionicons name="locate" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: "#FFFFFF",
  },
  darkContainer: {
    backgroundColor: "#1D1D1D",
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
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
  darkLocationButton: {
    backgroundColor: "#1D3D47",
  },
  lightLocationButton: {
    backgroundColor: "#A1CEDC",
  },
});
