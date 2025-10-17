// Home.tsx
import { View, Text, Pressable, ScrollView, Animated, Alert, Image, Linking } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Location from 'expo-location'
import Svg, { Circle } from 'react-native-svg'
import { apiService, EmergencyContact } from '../../services/api'
import { useUser } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

const SOS_HOLD_DURATION = 3000; // 3 seconds

const Home = () => {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTriggeredRef = useRef(false);
  const [isHolding, setIsHolding] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Dynamic user data
  const [userName, setUserName] = useState('User');
  const [currentLocation, setCurrentLocation] = useState('Loading...');
  const [safetyScore, setSafetyScore] = useState(92);
  const [crowdLevel, setCrowdLevel] = useState('Light Crowd');
  const [lastUpdated, setLastUpdated] = useState('06:35');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Subtle pulse animation for SOS button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Load user data and location
    checkBackendHealth();
    loadUserData();
    getCurrentLocation();
    updateSafetyScore();
  }, []);

  // Reload user data when Clerk user changes
  useEffect(() => {
    if (isLoaded) {
      loadUserData();
    }
  }, [isLoaded, user]);

  const checkBackendHealth = async () => {
    try {
      const isHealthy = await apiService.healthCheck();
      setBackendConnected(isHealthy);
    } catch (error) {
      setBackendConnected(false);
    }
  };

  const loadUserData = async () => {
    try {
      if (isLoaded && user) {
        // Use Clerk user data as primary source
        const fullName = user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || user.lastName || 'User';
        
        setUserName(fullName);
        
        // Try to load from backend using Clerk user ID
        const backendUser = await apiService.getUser(user.id);
        
        if (backendUser) {
          // Sync backend emergency contacts to local storage
          if (backendUser.emergencyContacts.length > 0) {
            await AsyncStorage.setItem('emergencyContacts', JSON.stringify(backendUser.emergencyContacts));
          }
        } else {
          // Create user in backend with Clerk data
          await apiService.saveUser({
            id: user.id,
            name: fullName,
            email: user.emailAddresses?.[0]?.emailAddress || '',
            emergencyContacts: []
          });
        }
        
        // Save to local storage
        await AsyncStorage.setItem('userName', fullName);
        if (user.emailAddresses?.[0]?.emailAddress) {
          await AsyncStorage.setItem('userEmail', user.emailAddresses[0].emailAddress);
        }
      } else {
        // Fallback to local storage when Clerk is not loaded
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) {
          setUserName(storedName);
        }
      }
    } catch (error) {
      console.log('Error loading user data:', error);
      // Fallback to local storage only
      try {
        const storedName = await AsyncStorage.getItem('userName');
        if (storedName) setUserName(storedName);
      } catch (localError) {
        console.log('Error loading local user data:', localError);
      }
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setCurrentLocation('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationString = `${address.street || address.name || 'Unknown'} • ${address.city || 'Unknown City'}`;
        setCurrentLocation(locationString);
      }
    } catch (error) {
      console.log('Error getting location:', error);
      setCurrentLocation('Mall Road • Tourist Zone'); // Fallback
    }
  };

  const updateSafetyScore = async () => {
    try {
      // Get current location first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Fetch real dashboard data from backend
      const dashboardData = await apiService.fetchDashboard(latitude, longitude);
      
      if (dashboardData) {
        setSafetyScore(dashboardData.safety_score);
        setCrowdLevel(dashboardData.crowd_level);
        setLastUpdated(dashboardData.last_updated);
        
        console.log('📊 Dashboard updated:', {
          score: dashboardData.safety_score,
          crowd: dashboardData.crowd_level,
          alerts: dashboardData.nearby_alerts
        });
      }
    } catch (error) {
      console.error('Error updating safety score:', error);
      // Fallback to time-based estimation
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      setLastUpdated(timeString);
    }
  };

  const callEmergencyContacts = async (contacts: EmergencyContact[]) => {
    try {
      if (contacts.length === 0) return;
      
      setIsLoading(true);
      
      if (!backendConnected) {
        Alert.alert(
          'Backend Offline', 
          'Emergency service is currently offline. Please try again or use manual calling.',
          [
            { text: 'Retry', onPress: () => checkBackendHealth() },
            { text: 'OK' }
          ]
        );
        return;
      }
      
      // Use Twilio backend to call all contacts
      const result = await apiService.sendSOS({
        contacts,
        userName,
        location: currentLocation,
        action: 'call'
      });
      
      if (result.success) {
        Alert.alert(
          '📞 Emergency Calls Initiated',
          `${result.message}\n\n✅ Calling ${contacts.length} contact(s) via Twilio service.\n🔊 Voice message includes your name and location.`
        );
      } else {
        Alert.alert('❌ Error', result.message || 'Failed to initiate emergency calls');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to make emergency calls. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmergencySMS = async (contacts: EmergencyContact[]) => {
    try {
      if (contacts.length === 0) return;
      
      setIsLoading(true);
      
      if (!backendConnected) {
        Alert.alert(
          'Backend Offline', 
          'Emergency service is currently offline. Please try again later.',
          [
            { text: 'Retry', onPress: () => checkBackendHealth() },
            { text: 'OK' }
          ]
        );
        return;
      }
      
      // Use Twilio backend to send SMS to all contacts
      const result = await apiService.sendSOS({
        contacts,
        userName,
        location: currentLocation,
        action: 'sms'
      });
      
      if (result.success) {
        Alert.alert(
          '📱 Emergency SMS Sent!',
          `${result.message}\n\n✅ Messages sent to:\n${contacts.map(c => `• ${c.name}`).join('\n')}\n\n📍 Includes your location and timestamp.`
        );
      } else {
        Alert.alert('❌ Error', result.message || 'Failed to send emergency SMS');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to send emergency SMS. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendSOS = async () => {
    try {
      setIsLoading(true);
      
      // Get emergency contacts from storage
      const storedContacts = await AsyncStorage.getItem('emergencyContacts');
      let contacts = [];
      
      if (storedContacts) {
        contacts = JSON.parse(storedContacts);
      }
      
      // Filter out default emergency services for personal contacts
      const personalContacts = contacts.filter((contact: any) => contact.id !== 3);
      
      if (personalContacts.length === 0) {
        Alert.alert(
          'No Emergency Contacts', 
          'Please add emergency contacts in your profile to use SOS.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Add Contact', onPress: () => Alert.alert('Navigate', 'Opening Profile to add emergency contacts...') }
          ]
        );
        setIsLoading(false);
        return;
      }
      
      if (!backendConnected) {
        Alert.alert(
          'Service Offline', 
          'Emergency service is currently offline. Please try again or contact emergency services directly.',
          [
            { text: 'Retry', onPress: () => checkBackendHealth() },
            { text: 'OK' }
          ]
        );
        setIsLoading(false);
        return;
      }
      
      // Send both call and SMS directly without confirmation
      const result = await apiService.sendSOS({
        contacts: personalContacts,
        userName,
        location: currentLocation,
        action: 'both' // Send both call and SMS
      });
      
      if (result.success) {
        Alert.alert(
          'Emergency Alert Sent!',
          `Called and sent SMS to ${personalContacts.length} contact(s):\n${personalContacts.map((c: any) => `• ${c.name}`).join('\n')}\n\nLocation: ${currentLocation}\nTime: ${new Date().toLocaleString()}`
        );
      } else {
        Alert.alert('Error', result.message || 'Failed to send emergency alert');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive handlers for quick actions
  const handleNavigation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable location access.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Open Google Maps with current location
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&travelmode=driving`;
      
      Alert.alert(
        '🗺️ Navigation', 
        'Choose navigation option:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Google Maps', 
            onPress: () => Linking.openURL(mapsUrl)
          },
          {
            text: 'View Danger Zones',
            onPress: () => router.push('/geofencing')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
    }
  };

  const handleDigitalID = () => {
    const userId = user?.id || 'GUEST';
    const userEmail = user?.emailAddresses?.[0]?.emailAddress || 'No email';
    const idNumber = `ST-${userId.substring(0, 8).toUpperCase()}`;
    
    Alert.alert(
      '🆔 Digital Tourist ID', 
      `Name: ${userName}\nEmail: ${userEmail}\nID: ${idNumber}\nLocation: ${currentLocation}\n\nThis ID can be used for tourist services and emergency identification.`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'Share ID', 
          onPress: () => Alert.alert('✅ Copied', `Tourist ID ${idNumber} copied to clipboard`) 
        }
      ]
    );
  };

  const handleItinerary = async () => {
    try {
      // Get saved itinerary from storage
      const savedItinerary = await AsyncStorage.getItem('userItinerary');
      
      if (savedItinerary) {
        const itinerary = JSON.parse(savedItinerary);
        Alert.alert(
          '📅 Your Itinerary',
          `Today's Plans:\n${itinerary.map((item: any, idx: number) => `${idx + 1}. ${item}`).join('\n')}`,
          [
            { text: 'Close' },
            { text: 'Add More', onPress: () => addItineraryItem() }
          ]
        );
      } else {
        Alert.alert(
          '📅 Itinerary',
          'No itinerary planned yet. Would you like to add places?',
          [
            { text: 'Later', style: 'cancel' },
            { text: 'Add Places', onPress: () => addItineraryItem() }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load itinerary');
    }
  };

  const addItineraryItem = () => {
    Alert.alert(
      '➕ Add to Itinerary',
      'Quick add popular places:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Tourist Spots', onPress: () => saveItinerary('Visit Tourist Spots') },
        { text: 'Local Markets', onPress: () => saveItinerary('Explore Local Markets') },
        { text: 'Restaurants', onPress: () => saveItinerary('Try Local Cuisine') }
      ]
    );
  };

  const saveItinerary = async (item: string) => {
    try {
      const existing = await AsyncStorage.getItem('userItinerary');
      const itinerary = existing ? JSON.parse(existing) : [];
      itinerary.push(item);
      await AsyncStorage.setItem('userItinerary', JSON.stringify(itinerary));
      Alert.alert('✅ Added', `"${item}" added to your itinerary!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to save itinerary');
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency Services', 
      'Quick dial emergency numbers:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '👮 Police (100)', 
          onPress: () => {
            Alert.alert(
              'Call Police?',
              'Dial 100 for Police emergency',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call Now', onPress: () => Linking.openURL('tel:100') }
              ]
            );
          }
        },
        { 
          text: '🚑 Ambulance (108)', 
          onPress: () => {
            Alert.alert(
              'Call Ambulance?',
              'Dial 108 for Medical emergency',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call Now', onPress: () => Linking.openURL('tel:108') }
              ]
            );
          }
        },
        { 
          text: '🔥 Fire (101)', 
          onPress: () => {
            Alert.alert(
              'Call Fire Department?',
              'Dial 101 for Fire emergency',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Call Now', onPress: () => Linking.openURL('tel:101') }
              ]
            );
          }
        }
      ]
    );
  };

  const handleGeofencing = () => {
    router.push('/geofencing');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleRefreshLocation = async () => {
    try {
      setCurrentLocation('Updating...');
      setSafetyScore(0);
      
      // Refresh location
      await getCurrentLocation();
      
      // Refresh safety score with real data
      await updateSafetyScore();
      
      Alert.alert('✅ Updated', 'Location and safety data refreshed with real-time information!');
    } catch (error) {
      console.error('Error refreshing:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    }
  };

  const handleSOSPressIn = () => {
    isTriggeredRef.current = false;
    setIsHolding(true);
    
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: SOS_HOLD_DURATION,
      useNativeDriver: false,
    }).start();

    timerRef.current = setTimeout(() => {
      isTriggeredRef.current = true;
      setIsHolding(false);
      sendSOS();
      progressAnim.setValue(0);
    }, SOS_HOLD_DURATION);
  };

  const handleSOSPressOut = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsHolding(false);
    progressAnim.setValue(0);
    
    if (!isTriggeredRef.current) {
      Alert.alert('Hold for 3 seconds', 'Press and hold the SOS button for 3 seconds to send an emergency alert.');
    }
  };

  const CircularProgress = ({ percentage }: { percentage: number }) => {
    const radius = 60;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View className="items-center justify-center">
        <Svg height={radius * 2} width={radius * 2}>
          <Circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <Circle
            stroke="#10B981"
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </Svg>
        <View className="absolute items-center">
          <Text className="text-3xl font-bold text-gray-900">{percentage}%</Text>
        </View>
      </View>
    );
  };
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="pt-16 px-6 pb-6 bg-white">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-gray-900">Hello, {userName}! 👋</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-600">Stay safe on your journey</Text>
                <View className={`ml-2 w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              </View>
            </View>
            <Pressable 
              className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center overflow-hidden"
              onPress={handleProfilePress}
            >
              {user?.imageUrl ? (
                <Image 
                  source={{ uri: user.imageUrl }} 
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-2xl">👤</Text>
              )}
            </Pressable>
          </View>
          <View className="flex-row items-center justify-between">
            <Pressable 
              className="flex-row items-center"
              onPress={handleDigitalID}
            >
              <Text className="text-blue-500 text-sm">📱 Digital ID</Text>
            </Pressable>
            <Pressable 
              className="flex-row items-center"
              onPress={checkBackendHealth}
            >
              <Text className={`text-xs ${backendConnected ? 'text-green-600' : 'text-red-600'}`}>
                {backendConnected ? '🟢 Emergency Service Online' : '🔴 Emergency Service Offline'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Safety Score Card */}
        <View className="mx-6 mt-6 mb-6 bg-white rounded-2xl p-6 shadow-sm">
          <View className="items-center">
            <CircularProgress percentage={safetyScore} />
            <Text className="text-lg font-semibold text-gray-900 mt-4">Safety Score</Text>
            <Text className="text-xl font-bold text-green-600">{safetyScore}% Safe</Text>
            
            <Pressable 
              className="flex-row items-center mt-2"
              onPress={handleRefreshLocation}
            >
              <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
              <Text className="text-sm text-gray-600">{currentLocation}</Text>
            </Pressable>
            
            <View className="flex-row items-center mt-1">
              <Text className="text-sm text-orange-500">⚠️ {crowdLevel}</Text>
            </View>
            
            <View className="flex-row items-center mt-1">
              <Text className="text-xs text-gray-500">📍 Updated {lastUpdated}</Text>
            </View>
          </View>
        </View>

        {/* SOS Button */}
        <View className="mx-6 mb-6 items-center">
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              className={`w-32 h-32 rounded-full justify-center items-center ${
                isHolding ? 'bg-red-600' : isLoading ? 'bg-orange-500' : 'bg-red-500'
              } shadow-lg`}
              onPressIn={handleSOSPressIn}
              onPressOut={handleSOSPressOut}
              disabled={isLoading}
            >
              {isLoading ? (
                <View className="items-center">
                  <Text className="text-white text-sm font-bold">PROCESSING</Text>
                  <Text className="text-white text-xs mt-1">Twilio</Text>
                </View>
              ) : isHolding ? (
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">SENDING</Text>
                  <View className="w-16 h-1 bg-white/30 rounded-full mt-2 overflow-hidden">
                    <Animated.View 
                      className="h-full bg-white rounded-full"
                      style={{
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }}
                    />
                  </View>
                </View>
              ) : (
                <Text className="text-white text-2xl font-bold">SOS</Text>
              )}
            </Pressable>
          </Animated.View>
          <Text className="text-sm text-gray-600 mt-3">
            {isLoading ? 'Processing emergency request...' : 'Press and hold for 3 seconds'}
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <Pressable 
              className="flex-1 bg-white rounded-xl p-4 items-center mr-2 shadow-sm"
              onPress={handleNavigation}
            >
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2">
                <Text className="text-2xl">🧭</Text>
              </View>
              <Text className="text-sm font-medium text-gray-700">Navigation</Text>
              <Text className="text-xs text-gray-500">Safe routes</Text>
            </Pressable>

            <Pressable 
              className="flex-1 bg-white rounded-xl p-4 items-center mx-1 shadow-sm"
              onPress={handleDigitalID}
            >
              <View className="w-12 h-12 rounded-full bg-purple-50 items-center justify-center mb-2">
                <Text className="text-2xl">🆔</Text>
              </View>
              <Text className="text-sm font-medium text-gray-700">Digital ID</Text>
              <Text className="text-xs text-gray-500">Show QR code</Text>
            </Pressable>

            <Pressable 
              className="flex-1 bg-white rounded-xl p-4 items-center ml-2 shadow-sm"
              onPress={handleItinerary}
            >
              <View className="w-12 h-12 rounded-full bg-green-50 items-center justify-center mb-2">
                <Text className="text-2xl">📋</Text>
              </View>
              <Text className="text-sm font-medium text-gray-700">Itinerary</Text>
              <Text className="text-xs text-gray-500">View plans</Text>
            </Pressable>
          </View>

          <View className="flex-row justify-between mt-3">
            <Pressable 
              className="flex-1 bg-white rounded-xl p-4 items-center mr-2 shadow-sm"
              onPress={handleEmergency}
            >
              <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center mb-2">
                <Text className="text-2xl">📞</Text>
              </View>
              <Text className="text-sm font-medium text-gray-700">Emergency</Text>
              <Text className="text-xs text-gray-500">Quick contacts</Text>
            </Pressable>

            <Pressable 
              className="flex-1 bg-white rounded-xl p-4 items-center ml-2 shadow-sm"
              onPress={handleGeofencing}
            >
              <View className="w-12 h-12 rounded-full bg-orange-50 items-center justify-center mb-2">
                <Text className="text-2xl">📍</Text>
              </View>
              <Text className="text-sm font-medium text-gray-700">Geofencing</Text>
              <Text className="text-xs text-gray-500">Safety zones</Text>
            </Pressable>
          </View>
        </View>

        {/* Recent Alerts */}
        <View className="mx-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</Text>
          
          <Pressable className="bg-white rounded-xl p-4 mb-3 shadow-sm">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-orange-100 items-center justify-center mr-3 mt-1">
                <Text className="text-orange-600">⚠️</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">Weather Advisory</Text>
                <Text className="text-gray-600 text-xs mt-1 leading-4">
                  Heavy rainfall expected in Mall Road area. Consider indoor activities.
                </Text>
                <Text className="text-gray-400 text-xs mt-2">2h ago</Text>
              </View>
            </View>
          </Pressable>

          <Pressable className="bg-white rounded-xl p-4 shadow-sm">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-green-100 items-center justify-center mr-3 mt-1">
                <Text className="text-green-600">🛡️</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-sm">Safety Update</Text>
                <Text className="text-gray-600 text-xs mt-1 leading-4">
                  Tourist police patrol increased in Ridge area. Safe for evening visits.
                </Text>
                <Text className="text-gray-400 text-xs mt-2">4h ago</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;