// Home.tsx
import { View, Text, Pressable, Alert, Animated, ScrollView } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignOutButton } from '@/components/SignOutButton';

const SOS_HOLD_DURATION = 3000; // 3 seconds

const Home = () => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTriggeredRef = useRef(false);
  const [isHolding, setIsHolding] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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
  }, []);

  const sendSOS = async () => {
    try {
      const contact = await AsyncStorage.getItem('emergencyContact');
      if (!contact) {
        Alert.alert('No Contact', 'Please set your emergency contact in Profile.');
        return;
      }
      await axios.post('http://192.168.1.12:5000/sos', {
        contact,
        message: 'SOS! I need help.'
      });
      Alert.alert('SOS Sent', 'Emergency message sent successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send SOS.');
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="pt-16 px-6 pb-6 bg-white border-b border-gray-100">
        <Text className="text-3xl font-bold text-gray-900">Stay Safe</Text>
        <Text className="text-base text-gray-500 mt-1">Your safety companion</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Main Content */}
        <View className="px-6 py-8">
          {/* SOS Section */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
            <View className="items-center">
              <Text className="text-sm text-gray-600 mb-6 font-medium">
                {isHolding ? 'Keep holding...' : 'Hold for 3 seconds'}
              </Text>
              
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Pressable
                  className={`w-52 h-52 rounded-full justify-center items-center border-4 border-white ${
                    isHolding ? 'bg-red-600' : 'bg-red-500'
                  }`}
                  onPressIn={handleSOSPressIn}
                  onPressOut={handleSOSPressOut}
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                  }}
                >
                  <View className="items-center">
                    <Text className="text-white text-6xl font-bold tracking-wider">SOS</Text>
                    <Text className="text-white text-base font-medium mt-2 opacity-90">Emergency</Text>
                  </View>
                  
                  {isHolding && (
                    <Animated.View
                      className="absolute w-56 h-56 rounded-full border-4 border-yellow-400"
                      style={{ opacity: progressAnim }}
                    />
                  )}
                </Pressable>
              </Animated.View>

              <Text className="text-xs text-gray-500 mt-6 text-center">
                Emergency services will be contacted
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-4">Quick Actions</Text>
            <View className="flex-row gap-3">
              <Pressable className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200">
                <View className="w-12 h-12 rounded-full bg-blue-50 justify-center items-center mb-2">
                  <Text className="text-2xl">📍</Text>
                </View>
                <Text className="text-xs font-medium text-gray-700 text-center">Share{'\n'}Location</Text>
              </Pressable>

              <Pressable className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200">
                <View className="w-12 h-12 rounded-full bg-green-50 justify-center items-center mb-2">
                  <Text className="text-2xl">🏥</Text>
                </View>
                <Text className="text-xs font-medium text-gray-700 text-center">Find{'\n'}Hospital</Text>
              </Pressable>

              <Pressable className="flex-1 bg-white rounded-xl p-4 items-center border border-gray-200">
                <View className="w-12 h-12 rounded-full bg-purple-50 justify-center items-center mb-2">
                  <Text className="text-2xl">🚔</Text>
                </View>
                <Text className="text-xs font-medium text-gray-700 text-center">Police{'\n'}Station</Text>
              </Pressable>
            </View>
          </View>

          {/* Emergency Contacts */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-4">Emergency Contacts</Text>
            <View className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <Pressable className="flex-row items-center justify-between p-4 border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-red-50 justify-center items-center mr-3 border border-red-100">
                    <Text className="text-xl">🚨</Text>
                  </View>
                  <View>
                    <Text className="font-semibold text-gray-900 text-sm">Police</Text>
                    <Text className="text-gray-500 text-xs">Emergency Hotline</Text>
                  </View>
                </View>
                <Text className="font-bold text-blue-600 text-lg">100</Text>
              </Pressable>

              <Pressable className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-full bg-green-50 justify-center items-center mr-3 border border-green-100">
                    <Text className="text-xl">🏥</Text>
                  </View>
                  <View>
                    <Text className="font-semibold text-gray-900 text-sm">Ambulance</Text>
                    <Text className="text-gray-500 text-xs">Medical Emergency</Text>
                  </View>
                </View>
                <Text className="font-bold text-blue-600 text-lg">108</Text>
              </Pressable>
            </View>
          </View>

          {/* Safety Tip */}
          <View className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-200">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-white justify-center items-center mr-3">
                <Text className="text-lg">💡</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold text-sm mb-1">Safety Tip</Text>
                <Text className="text-gray-600 text-xs leading-4">
                  Always keep your emergency contact updated
                </Text>
              </View>
            </View>
          </View>

          {/* Sign Out Button */}
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;