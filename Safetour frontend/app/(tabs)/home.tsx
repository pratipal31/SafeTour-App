// Home.tsx
import { View, Text, Pressable, Alert, Animated } from 'react-native';
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
      await axios.post('http://192.168.1.100:5000/sos', {
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
    <View className="flex-1 bg-slate-50">
      {/* Header Section */}
      <View className="pt-16 px-6 pb-8 bg-white rounded-b-[32px] shadow-sm">
        <Text className="text-4xl font-bold text-slate-800 mb-1">Stay Safe</Text>
        <Text className="text-lg text-slate-500">Your safety companion</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 pt-10 px-6">
        {/* SOS Button */}
        <View className="items-center mb-12">
          <Text className="text-base text-slate-500 mb-6 font-medium">
            {isHolding ? 'Keep holding...' : 'Hold for 3 seconds'}
          </Text>
          
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Pressable
              className={`w-52 h-52 rounded-full justify-center items-center border-6 border-white shadow-2xl ${
                isHolding ? 'bg-red-700' : 'bg-red-500'
              }`}
              onPressIn={handleSOSPressIn}
              onPressOut={handleSOSPressOut}
              style={{
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: isHolding ? 0.6 : 0.4,
                shadowRadius: 24,
                elevation: 12,
              }}
            >
              <View className="items-center">
                <Text className="text-white text-6xl font-bold tracking-[4px]">SOS</Text>
                <Text className="text-white text-base font-semibold mt-1 opacity-90">Emergency</Text>
              </View>
              
              {isHolding && (
                <Animated.View
                  className="absolute w-56 h-56 rounded-full border-4 border-yellow-400"
                  style={{ opacity: progressAnim }}
                />
              )}
            </Pressable>
          </Animated.View>

          <Text className="text-sm text-slate-500 mt-6 text-center">
            Emergency services will be contacted
          </Text>
        </View>

        {/* Quick Actions */}
        <View className="flex-row justify-between gap-3">
          <Pressable className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
            <View className="w-14 h-14 rounded-full bg-slate-100 justify-center items-center mb-3">
              <Text className="text-3xl">📍</Text>
            </View>
            <Text className="text-xs font-semibold text-slate-700 text-center">Share Location</Text>
          </Pressable>

          <Pressable className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
            <View className="w-14 h-14 rounded-full bg-slate-100 justify-center items-center mb-3">
              <Text className="text-3xl">🏥</Text>
            </View>
            <Text className="text-xs font-semibold text-slate-700 text-center">Find Hospital</Text>
          </Pressable>

          <Pressable className="flex-1 bg-white rounded-2xl p-5 items-center shadow-sm">
            <View className="w-14 h-14 rounded-full bg-slate-100 justify-center items-center mb-3">
              <Text className="text-3xl">🚔</Text>
            </View>
            <Text className="text-xs font-semibold text-slate-700 text-center">Police Station</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        <View className="flex-row items-center bg-yellow-100 rounded-xl p-4 mb-4">
          <Text className="text-2xl mr-3">💡</Text>
          <Text className="flex-1 text-sm text-yellow-900 font-medium">
            Always keep your emergency contact updated
          </Text>
        </View>
        <SignOutButton />
      </View>
    </View>
  );
};

export default Home;