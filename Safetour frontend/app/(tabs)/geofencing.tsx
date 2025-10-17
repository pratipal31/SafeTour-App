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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
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
            }
          }
          setCurrentZone(detectedZone);

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
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading || !coords) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2196F3" />
        <Text className="mt-2.5 text-base text-gray-700">Fetching your location...</Text>
      </View>
    );
  }

  return (
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
