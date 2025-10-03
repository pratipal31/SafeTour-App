// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

/**
 * Define multiple zones with coordinates and radius
 * - color: for map circle
 */
const ZONES = [
  {
    id: 'Danger Zone',
    latitude: 19.4199,
    longitude: 72.8117,
    radius: 500,
    color: 'red',
  },
  {
    id: 'Moderately Safe Zone',
    latitude: 19.42, // Example coordinates
    longitude: 72.815,
    radius: 700,
    color: 'orange',
  },
];

/**
 * Calculate distance in meters between two coordinates
 */
function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Build HTML for Leaflet map with multiple zones
 */
function buildHtml(lat, lng, zones) {
  const circlesHtml = zones
    .map(
      (zone) => `
    L.circle([${zone.latitude}, ${zone.longitude}], {
      color: '${zone.color}',
      fillColor: '${zone.color}',
      fillOpacity: 0.3,
      radius: ${zone.radius}
    }).addTo(map)
      .bindPopup('${zone.id}');`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([${lat}, ${lng}], 12);

    // Base tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // User marker
    L.marker([${lat}, ${lng}])
      .addTo(map)
      .bindPopup('You are here');

    // Add all zones
    ${circlesHtml}
  </script>
</body>
</html>`;
}

/**
 * GeofencingScreen component
 */
export default function GeofencingScreen() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState('Requesting location permission...');
  const [currentZone, setCurrentZone] = useState('Safe Zone');

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { status: permission } = await Location.requestForegroundPermissionsAsync();
        if (permission !== 'granted') {
          Alert.alert('Permission required', 'We need your location to show the map.');
          setStatus('Permission denied');
          return;
        }

        setStatus('Locating you...');
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (mounted) {
          const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(userCoords);

          // Determine which zone the user is in
          let detectedZone = 'Safe Zone';
          for (let zone of ZONES) {
            const distance = getDistanceFromLatLonInMeters(
              userCoords.lat,
              userCoords.lng,
              zone.latitude,
              zone.longitude
            );
            if (distance <= zone.radius) {
              detectedZone = zone.id;
              break; // Stop at the first matched zone
            }
          }
          setCurrentZone(detectedZone);

          Alert.alert(
            detectedZone === 'Safe Zone' ? 'Safe' : 'Warning!',
            detectedZone === 'Safe Zone' ? 'You are in a safe area.' : `You are in ${detectedZone}!`
          );
        }
      } catch (e) {
        console.log('Location error:', e);
        setStatus('Error fetching location');
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const html = coords ? buildHtml(coords.lat, coords.lng, ZONES) : null;

  if (!coords) {
    return (
      <View style={styles.center}>
        <Text style={styles.note}>{status}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.title}>Geo-Fencing Status</Text>

      <View style={styles.zoneCircle}>
        <Text style={styles.zoneText}>{currentZone}</Text>
      </View>

      <View style={styles.mapCard}>
        <WebView originWhitelist={['*']} source={{ html: html || '' }} style={styles.webview} />
      </View>

      <Text style={styles.description}>
        You are currently in <Text style={{ fontWeight: 'bold' }}>{currentZone}</Text>.
      </Text>
    </ScrollView>
  );
}

/**
 * Styles
 */
const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 20,
  },
  zoneCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#EEF2FF',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  zoneText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  mapCard: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  note: {
    fontSize: 16,
    color: '#374151',
  },
});
