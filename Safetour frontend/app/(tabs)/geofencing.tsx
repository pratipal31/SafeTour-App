<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Circle } from 'react-native-maps';

const API_URL = 'http://192.168.1.12:5000/danger-zones'; // CHANGE IP TO YOUR COMPUTER IP

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface DangerZone {
  location: string;
  risk_type: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  distance_km: number;
  related_headlines: string[];
}

export default function GeofencingScreen() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [currentZone, setCurrentZone] = useState<string>('Safe Zone');
  const [loading, setLoading] = useState<boolean>(true);
  const [cityName, setCityName] = useState<string>('');
=======
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
  {
    id: 'Andheri',
    latitude: 19.119,      // approx. latitude for Andheri, Mumbai :contentReference[oaicite:0]{index=0}
    longitude: 72.847,     // approx. longitude for Andheri, Mumbai :contentReference[oaicite:1]{index=1}
    radius: 600,
    color: 'blue',
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
>>>>>>> a7b3ab15f27386648bee156e40f00039e5559633

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
<<<<<<< HEAD
        // Step 1: Request location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'We need your location to show the map.');
          setLoading(false);
          return;
        }

        // Step 2: Get user's current coordinates
        const pos = await Location.getCurrentPositionAsync({ 
          accuracy: Location.Accuracy.High 
        });
        const userCoords: Coordinates = { 
          latitude: pos.coords.latitude, 
          longitude: pos.coords.longitude 
        };
        if (mounted) setCoords(userCoords);

        console.log('📍 User Location:', userCoords);

        // Step 3: Send coordinates to Python Flask API
        const apiUrl = `${API_URL}?lat=${userCoords.latitude}&lon=${userCoords.longitude}`;
        console.log('🔗 Calling API:', apiUrl);

        const res = await fetch(apiUrl);
        const data = await res.json();

        console.log('📡 API Response:', data);

        if (data.danger_zones && mounted) {
          setCityName(data.city || 'Unknown');
          setDangerZones(data.danger_zones);

          // Step 4: Check if user is inside any danger zone
          let detectedZone = 'Safe Zone';
          for (let zone of data.danger_zones) {
            const distance = getDistanceFromLatLonInMeters(
              userCoords.latitude,
              userCoords.longitude,
              zone.latitude,
              zone.longitude
            );
            if (distance <= (zone.radius || 500)) {
              detectedZone = zone.location;
              break;
=======
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
>>>>>>> a7b3ab15f27386648bee156e40f00039e5559633
            }
          }
          setCurrentZone(detectedZone);

<<<<<<< HEAD
          // Step 5: Show alert
          Alert.alert(
            detectedZone === 'Safe Zone' ? '✅ Safe' : '⚠️ Warning!',
            detectedZone === 'Safe Zone' 
              ? 'You are in a safe area.' 
              : `You are in ${detectedZone}! Risk: ${data.danger_zones.find((z: DangerZone) => z.location === detectedZone)?.risk_type}`
          );
        }

        setLoading(false);
      } catch (e) {
        console.log('❌ Error:', e);
        Alert.alert('Error', 'Could not connect to server. Make sure Flask is running.');
        setLoading(false);
=======
          Alert.alert(
            detectedZone === 'Safe Zone' ? 'Safe' : 'Warning!',
            detectedZone === 'Safe Zone' ? 'You are in a safe area.' : `You are in ${detectedZone}!`
          );
        }
      } catch (e) {
        console.log('Location error:', e);
        setStatus('Error fetching location');
>>>>>>> a7b3ab15f27386648bee156e40f00039e5559633
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

<<<<<<< HEAD
  if (loading || !coords) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="mt-2.5 text-base text-gray-700">Fetching your location...</Text>
=======
  const html = coords ? buildHtml(coords.lat, coords.lng, ZONES) : null;

  if (!coords) {
    return (
      <View style={styles.center}>
        <Text style={styles.note}>{status}</Text>
>>>>>>> a7b3ab15f27386648bee156e40f00039e5559633
      </View>
    );
  }

  return (
<<<<<<< HEAD
    <View className="flex-1">
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* User Marker (Blue) */}
        <Marker 
          coordinate={coords} 
          title="You are here" 
          pinColor="blue"
          description={cityName}
        />

        {/* Danger Zones - Circles */}
        {dangerZones.map((zone, i) => (
          <Circle
            key={`circle-${i}`}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            radius={zone.radius || 500}
            strokeColor={zone.severity === 'High' ? 'rgba(255,0,0,0.9)' : 'rgba(255,165,0,0.9)'}
            fillColor={zone.severity === 'High' ? 'rgba(255,0,0,0.3)' : 'rgba(255,165,0,0.2)'}
            strokeWidth={2}
          />
        ))}

        {/* Danger Zone Markers (Red) */}
        {dangerZones.map((zone, i) => (
          <Marker
            key={`marker-${i}`}
            coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
            title={`${zone.risk_type} - ${zone.severity}`}
            description={zone.description}
            pinColor="red"
          />
        ))}
      </MapView>

      {/* Current Zone Info Box */}
      <View 
        className={`absolute bottom-8 self-center px-5 py-4 rounded-xl shadow-lg ${
          currentZone === 'Safe Zone' ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 8,
        }}
      >
        <Text className="text-xs font-semibold text-white opacity-90">
          Current Zone:
        </Text>
        <Text className="font-bold text-lg text-white mt-1">
          {currentZone}
        </Text>
        <Text className="text-xs text-white mt-1 opacity-80">
          {dangerZones.length} danger zones detected
        </Text>
      </View>
    </View>
  );
}

// Haversine formula for distance (in meters)
function getDistanceFromLatLonInMeters(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
=======
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Text className="pt-4"style={styles.title}>Geo-Fencing Status</Text>

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
>>>>>>> a7b3ab15f27386648bee156e40f00039e5559633
