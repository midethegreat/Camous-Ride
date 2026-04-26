import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions, Platform, Text } from "react-native";
import { Navigation, MapPin } from "lucide-react-native";
import { CampusLocation } from "@/types";
import Colors from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

// Try to import MapView, but provide a fallback for web
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;

try {
  if (Platform.OS !== "web") {
    const maps = require("react-native-maps");
    MapView = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  }
} catch (error) {
  console.log("react-native-maps not available on this platform");
}

const ProfessionalMap = ({
  pickup,
  destination,
  center,
  locations,
  onMarkerPress,
  userLocation,
}: ProfessionalMapProps) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (mapRef.current && MapView && (pickup || destination)) {
      const coordinates = [];
      if (pickup) coordinates.push(pickup);
      if (destination) coordinates.push(destination);

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  }, [pickup, destination]);

  // Web fallback
  if (Platform.OS === "web" || !MapView) {
    return (
      <View style={styles.container}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.title}>Map View</Text>
          <Text style={styles.subtitle}>
            Map functionality is not available on web
          </Text>

          {pickup && (
            <View style={styles.locationInfo}>
              <Navigation size={16} color={Colors.primary} />
              <Text style={styles.locationText}>
                Pickup:{" "}
                {pickup.name ||
                  `${pickup.latitude.toFixed(4)}, ${pickup.longitude.toFixed(4)}`}
              </Text>
            </View>
          )}

          {destination && (
            <View style={styles.locationInfo}>
              <MapPin size={16} color={Colors.primary} />
              <Text style={styles.locationText}>
                Destination:{" "}
                {destination.name ||
                  `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`}
              </Text>
            </View>
          )}

          {userLocation && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Your Location: {userLocation.latitude.toFixed(4)},{" "}
                {userLocation.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          {locations.length > 0 && (
            <View style={styles.locationsList}>
              <Text style={styles.locationsTitle}>Nearby Locations:</Text>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={styles.locationItem}
                  onPress={() => onMarkerPress?.(location)}
                >
                  <MapPin size={14} color={Colors.primary} />
                  <Text style={styles.locationItemText}>{location.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        showsTraffic={true}
        userLocationCalloutEnabled={true}
        followsUserLocation={true}
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Your Location"
            pinColor={Colors.primary}
          />
        )}

        {pickup && (
          <Marker
            coordinate={pickup}
            title={pickup.name}
            description={pickup.description}
            onPress={() => onMarkerPress?.(pickup)}
          >
            <View style={styles.customMarker}>
              <Navigation size={20} color={Colors.white} fill={Colors.white} />
            </View>
          </Marker>
        )}

        {destination && (
          <Marker
            coordinate={destination}
            title={destination.name}
            description={destination.description}
            onPress={() => onMarkerPress?.(destination)}
          >
            <View style={[styles.customMarker, styles.destinationMarker]}>
              <MapPin size={20} color={Colors.white} fill={Colors.white} />
            </View>
          </Marker>
        )}

        {locations.map((location) => (
          <Marker
            key={location.id}
            coordinate={location}
            title={location.name}
            description={location.description}
            onPress={() => onMarkerPress?.(location)}
          >
            <View style={styles.locationMarker}>
              <MapPin size={16} color={Colors.primary} />
            </View>
          </Marker>
        ))}

        {pickup && destination && (
          <Polyline
            coordinates={[pickup, destination]}
            strokeColor={Colors.primary}
            strokeWidth={3}
            lineDashPattern={[5, 5]}
          />
        )}
      </MapView>
    </View>
  );
};

interface ProfessionalMapProps {
  pickup: CampusLocation | null;
  destination: CampusLocation | null;
  center: { latitude: number; longitude: number };
  locations: CampusLocation[];
  onMarkerPress?: (loc: CampusLocation) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  mapPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.lightGray,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: 16,
    textAlign: "center",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    width: "100%",
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  locationsList: {
    marginTop: 16,
    width: "100%",
  },
  locationsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  locationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.white,
    borderRadius: 6,
    marginVertical: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationItemText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text,
  },
  customMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  destinationMarker: {
    backgroundColor: Colors.secondary,
  },
  locationMarker: {
    backgroundColor: Colors.white,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
});

export default ProfessionalMap;
