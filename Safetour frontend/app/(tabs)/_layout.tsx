import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Shield, MapPin, Ruler, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs>
      {/* Maps to existing route: app/(tabs)/home.tsx */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown:false,
          tabBarIcon: ({ size, color }) => <Home size={size} color={color} />,
        }}
      />
      {/* Maps to existing route: app/(tabs)/saved.tsx */}
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ size, color }) => <Shield size={size} color={color} />,
        }}
      />
      {/* Maps to existing route: app/(tabs)/search.tsx */}
      <Tabs.Screen
        name="search"
        options={{
          title: 'Explore',
          tabBarIcon: ({ size, color }) => <MapPin size={size} color={color} />,
        }}
      />
      {/* Maps to existing route: app/(tabs)/geofencing.tsx */}
      <Tabs.Screen
        name="geofencing"
        options={{
          title: 'Geofencing',
          headerShown:false,
          tabBarIcon: ({ size, color }) => <Ruler size={size} color={color} />,
        }}
      />
      {/* Maps to existing route: app/(tabs)/profile.tsx */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown:false,
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
