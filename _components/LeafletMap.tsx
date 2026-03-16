import React, { useMemo, useEffect, useRef } from 'react';
import { StyleSheet, View, Platform, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { CampusLocation } from '@/_types';
import Colors from '@/_constants/Colors';

interface LeafletMapProps {
  pickup: CampusLocation | null;
  destination: CampusLocation | null;
  onMarkerPress?: (loc: CampusLocation) => void;
  center: { latitude: number; longitude: number };
  locations: CampusLocation[];
  zoom?: number;
}

export default function LeafletMap({
  pickup,
  destination,
  onMarkerPress,
  center,
  locations,
  zoom = 16,
}: LeafletMapProps) {
  const webRef = useRef<WebView>(null);

  const htmlContent = useMemo(() => {
    const pickupMarker = pickup 
      ? `L.marker([${pickup.latitude}, ${pickup.longitude}], {icon: pickupIcon}).addTo(map);` 
      : '';
    
    const destinationMarker = destination 
      ? `L.marker([${destination.latitude}, ${destination.longitude}], {icon: destinationIcon}).addTo(map);` 
      : '';

    const allMarkers = locations.map(loc => `
      L.marker([${loc.latitude}, ${loc.longitude}], {icon: defaultIcon})
        .addTo(map)
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({type: 'markerPress', locationId: '${loc.id}'}));
        });
    `).join('\n');

    const routingLogic = (pickup && destination) 
      ? `
        fetch('https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson')
          .then(response => response.json())
          .then(data => {
            if (data.routes && data.routes.length > 0) {
              const route = data.routes[0].geometry;
              const routeLayer = L.geoJSON(route, {
                style: { color: '${Colors.primary}', weight: 5, opacity: 0.7 }
              }).addTo(map);
              map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
            }
          })
          .catch(err => console.error('OSRM Error:', err));
      `
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Leaflet Map</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body { margin: 0; padding: 0; }
          #map { height: 100vh; width: 100vw; background: #f0f0f0; }
          .leaflet-control-attribution { display: none; }
          .locate-btn {
            position: absolute;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            background: white;
            padding: 10px;
            border-radius: 50%;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            cursor: pointer;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <div class="locate-btn" onclick="locateUser()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${Colors.primary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M3 12h3m12 0h3M12 3v3m0 12v3"></path></svg>
        </div>
        <script>
          const map = L.map('map', { zoomControl: false }).setView([${center.latitude}, ${center.longitude}], ${zoom});
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
          }).addTo(map);

          const pickupIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          });

          const destinationIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          });

          const defaultIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [20, 32], iconAnchor: [10, 32], popupAnchor: [1, -34], shadowSize: [32, 32]
          });

          ${allMarkers}
          ${pickupMarker}
          ${destinationMarker}
          ${routingLogic}

          function locateUser() {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                map.flyTo([latitude, longitude], 17);
                L.circle([latitude, longitude], { radius: 20, color: '${Colors.primary}', fillOpacity: 0.3 }).addTo(map);
              }, (err) => {
                console.error("Geolocation Error:", err);
              });
            }
          }
        </script>
      </body>
      </html>
    `;
  }, [pickup, destination, locations, center, zoom]);

  useEffect(() => {
    if (webRef.current) {
      const script = `
        try {
          if (typeof map !== 'undefined') {
            map.setView([${center.latitude}, ${center.longitude}], ${zoom});
          }
        } catch (e) {}
        true;
      `;
      webRef.current.injectJavaScript(script);
    }
  }, [center.latitude, center.longitude, zoom]);

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerPress') {
        const loc = locations.find(l => l.id === data.locationId);
        if (loc && onMarkerPress) {
          onMarkerPress(loc);
        }
      }
    } catch (e) {
      console.error("Leaflet message error:", e);
    }
  };

  if (Platform.OS === 'web') {
    return <View style={styles.webFallback}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        geolocationEnabled={true}
        renderLoading={() => <ActivityIndicator style={styles.loading} size="large" color={Colors.primary} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loading: { position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -20 },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }
});
