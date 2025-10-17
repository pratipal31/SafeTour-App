import { View, Text, TouchableOpacity, Animated, ScrollView } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LandingPage = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignUp = () => {
    router.push('/(tabs)/registration');
  };

  const handleSignIn = () => {
    alert('Sign In page coming soon!');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#2E2EFF' }}>
      <SafeAreaView className="flex-1">
        {/* Decorative Background Elements */}
        <View className="absolute right-0 top-20 h-64 w-64 rounded-full bg-white/5" />
        <View className="absolute -left-20 top-40 h-40 w-40 rounded-full bg-white/5" />
        <View className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-white/10" />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <Animated.View
            className="flex-1 px-6 py-8"
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}>
            {/* Header Section */}
            <View className="mt-8">
              {/* Badge */}
              <View className="mb-6 self-center rounded-full bg-white/15 px-5 py-2.5 backdrop-blur-xl">
                <View className="flex-row items-center">
                  <View className="mr-2 h-2 w-2 rounded-full bg-green-400" />
                  <Text className="text-xs font-bold tracking-widest text-white">
                    TRUSTED BY 10,000+ HOTELS
                  </Text>
                </View>
              </View>

              {/* Logo & Title */}
              <View className="items-center">
                <View className="mb-6 flex-row items-center justify-center">
                  <Text className="text-5xl font-black text-white" style={{ letterSpacing: -1 }}>
                    SafeTour
                  </Text>
                  <View className="ml-3 h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                    <Text className="text-3xl">🏨</Text>
                  </View>
                </View>

                <Text className="mb-2 text-center text-2xl font-bold text-white">
                  Grow Your Hotel Business
                </Text>
                <Text className="px-4 text-center text-base leading-6 text-white/80">
                  Join thousands of successful hoteliers. Increase bookings, maximize revenue, and
                  reach global travelers.
                </Text>
              </View>
            </View>

            {/* Features Grid */}
            <View className="my-6">
              <View className="mb-4 flex-row gap-3">
                <View className="flex-1 items-center rounded-3xl bg-white/10 p-4 backdrop-blur-xl">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Ionicons name="trending-up" size={28} color="#fff" />
                  </View>
                  <Text className="text-center text-sm font-bold text-white">50% More</Text>
                  <Text className="text-center text-xs text-white/70">Bookings</Text>
                </View>

                <View className="flex-1 items-center rounded-3xl bg-white/10 p-4 backdrop-blur-xl">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Ionicons name="cash-outline" size={28} color="#fff" />
                  </View>
                  <Text className="text-center text-sm font-bold text-white">Zero Fee</Text>
                  <Text className="text-center text-xs text-white/70">3 Months</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 items-center rounded-3xl bg-white/10 p-4 backdrop-blur-xl">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Ionicons name="shield-checkmark" size={28} color="#fff" />
                  </View>
                  <Text className="text-center text-sm font-bold text-white">100% Safe</Text>
                  <Text className="text-center text-xs text-white/70">Payments</Text>
                </View>

                <View className="flex-1 items-center rounded-3xl bg-white/10 p-4 backdrop-blur-xl">
                  <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                    <Ionicons name="headset-outline" size={28} color="#fff" />
                  </View>
                  <Text className="text-center text-sm font-bold text-white">24/7</Text>
                  <Text className="text-center text-xs text-white/70">Support</Text>
                </View>
              </View>
            </View>

            {/* Benefits Card */}
            <View className="mb-6 rounded-3xl bg-white/10 p-6 backdrop-blur-xl">
              <Text className="mb-4 text-center text-lg font-bold text-white">
                Why Partner With Us?
              </Text>

              <View className="mb-3 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-400">
                  <Ionicons name="checkmark" size={18} color="#2E2EFF" />
                </View>
                <Text className="flex-1 text-base text-white">Instant property listing</Text>
              </View>

              <View className="mb-3 flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-400">
                  <Ionicons name="checkmark" size={18} color="#2E2EFF" />
                </View>
                <Text className="flex-1 text-base text-white">Real-time booking dashboard</Text>
              </View>

              <View className="flex-row items-center">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-400">
                  <Ionicons name="checkmark" size={18} color="#2E2EFF" />
                </View>
                <Text className="flex-1 text-base text-white">Guaranteed payouts weekly</Text>
              </View>
            </View>

            {/* CTA Buttons - Sign Up and Sign In */}
            <View className="mb-4">
              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSignUp}
                className="mb-4 overflow-hidden rounded-2xl bg-white shadow-2xl"
                activeOpacity={0.9}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  elevation: 10,
                }}>
                <View className="flex-row items-center justify-center py-5">
                  <Ionicons name="rocket" size={24} color="#2E2EFF" style={{ marginRight: 8 }} />
                  <Text className="text-xl font-black" style={{ color: '#2E2EFF' }}>
                    Sign Up Now
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                className="mb-4 overflow-hidden rounded-2xl border-2 border-white bg-transparent"
                activeOpacity={0.9}
                style={{
                  borderColor: 'rgba(255,255,255,0.5)',
                }}>
                <View className="flex-row items-center justify-center py-5">
                  <Ionicons
                    name="log-in-outline"
                    size={24}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-xl font-black text-white">Sign In</Text>
                </View>
              </TouchableOpacity>

              {/* Trust Badge */}
              <View className="flex-row items-center justify-center">
                <Ionicons name="lock-closed" size={14} color="rgba(255,255,255,0.6)" />
                <Text className="ml-2 text-xs text-white/60">
                  Secure registration • Takes only 2 minutes
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View className="items-center pb-2">
              <Text className="mb-2 text-center text-xs text-white/50">
                By continuing, you agree to our Terms & Privacy Policy
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#FFD700" />
                <Ionicons name="star" size={12} color="#FFD700" />
                <Ionicons name="star" size={12} color="#FFD700" />
                <Ionicons name="star" size={12} color="#FFD700" />
                <Ionicons name="star" size={12} color="#FFD700" />
                <Text className="ml-2 text-xs font-semibold text-white/70">
                  4.9/5 from 12,000+ hotels
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default LandingPage;
