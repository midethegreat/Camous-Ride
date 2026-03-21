import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Dimensions, Platform } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from "react-native-maps";
import { Navigation, MapPin } from "lucide-react-native";
import { CampusLocation } from "@/types";
import Colors from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

const mapStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f0f0f0" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "on" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#444444" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#94d3f3" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#ffeb3b" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#c5e1a5" }],
  },
];

interface ProfessionalMapProps {
  pickup: CampusLocation | null;
  destination: CampusLocation | null;
  center: { latitude: number; longitude: number };
  locations: CampusLocation[];
  onMarkerPress?: (loc: CampusLocation) => void;
  userLocation?: { latitude: number; longitude: number } | null;
}

export default function ProfessionalMap({
  pickup,
  destination,
  center,
  locations,
  onMarkerPress,
  userLocation,
}: ProfessionalMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (mapRef.current) {
      const coords = [];
      if (pickup) coords.push({ latitude: pickup.latitude, longitude: pickup.longitude });
      if (destination) coords.push({ latitude: destination.latitude, longitude: destination.longitude });
      if (userLocation) coords.push({ latitude: userLocation.latitude, longitude: userLocation.longitude });

      if (coords.length >= 2) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        });
      } else if (center) {
        mapRef.current.animateToRegion({
          ...center,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        });
      }
    }
  }, [pickup, destination, center]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...center,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
        customMapStyle={mapStyle}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        showsPointsOfInterest={false}
      >
        {/* All Campus Locations */}
        {locations.map((loc) => (
          <Marker
            key={loc.id}
            coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
            onPress={() => onMarkerPress && onMarkerPress(loc)}
          >
            <View style={styles.locationMarker}>
              <View style={styles.locationDot} />
            </View>
          </Marker>
        ))}

        {/* Pickup Marker */}
        {pickup && (
          <Marker
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title="Pickup"
          >
            <View style={styles.pickupMarker}>
              <View style={styles.pickupDot} />
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title="Destination"
          >
            <View style={styles.destinationMarker}>
              <MapPin size={24} color="white" fill="white" />
            </View>
          </Marker>
        )}

        {/* Route Line */}
        {pickup && destination && (
          <Polyline
            coordinates={[
              { latitude: pickup.latitude, longitude: pickup.longitude },
              { latitude: destination.latitude, longitude: destination.longitude },
            ]}
            strokeColor={Colors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  locationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(27, 122, 67, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  pickupMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pickupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  destinationMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.red,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
