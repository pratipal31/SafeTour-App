import { View, Text, TouchableOpacity, ScrollView , Image } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const LandingPage = () => {
  const router = useRouter();
  const handleLogin = () => {
    router.push('/sign-in');
  };

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-600">
      <View className="flex-1 justify-between px-8 py-12">
        {/* Header Section */}
        <View className="mt-16 items-center">
          <View className="mb-6 rounded-full bg-white/20 px-6 py-2">
            <Text className="text-xs font-semibold tracking-widest text-white">
              YOUR TRAVEL COMPANION
            </Text>
          </View>

          <View className="mb-6 flex-row items-center justify-center">
            <Text className="mr-3 text-center text-6xl font-bold text-white">SafeTour</Text>
            <Image
              source={require('@/assets/images/logo.png')} // 👈 adjust path
              className="h-14 w-14"
              resizeMode="contain"
            />
          </View>
          <Text className="mt-2 px-6 text-center text-xl leading-8 text-white/90">
            Explore the world with confidence. Your safety, our priority.
          </Text>
        </View>

        {/* Feature Icons Section */}
        <View className="my-8 flex-row justify-around px-2">
          <View className="items-center">
            <View className="mb-3 h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
              <Text className="text-4xl">🛡️</Text>
            </View>
            <Text className="text-sm font-semibold text-white">Secure</Text>
          </View>

          <View className="items-center">
            <View className="mb-3 h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
              <Text className="text-4xl">🌍</Text>
            </View>
            <Text className="text-sm font-semibold text-white">Global</Text>
          </View>

          <View className="items-center">
            <View className="mb-3 h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
              <Text className="text-4xl">⚡</Text>
            </View>
            <Text className="text-sm font-semibold text-white">Fast</Text>
          </View>

          <View className="items-center">
            <View className="mb-3 h-20 w-20 items-center justify-center rounded-2xl bg-white/20">
              <Text className="text-4xl">💼</Text>
            </View>
            <Text className="text-sm font-semibold text-white">Reliable</Text>
          </View>
        </View>

        {/* Bottom Section with Buttons */}
        <View className="mb-6">
          {/* Benefits List */}
          <View className="mb-8 rounded-3xl bg-white/15 p-8">
            <View className="mb-5 flex-row items-center">
              <Text className="mr-3 text-2xl text-white">✓</Text>
              <Text className="text-lg text-white">Real-time safety alerts</Text>
            </View>
            <View className="mb-5 flex-row items-center">
              <Text className="mr-3 text-2xl text-white">✓</Text>
              <Text className="text-lg text-white">Emergency assistance 24/7</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-3 text-2xl text-white">✓</Text>
              <Text className="text-lg text-white">Trusted by millions worldwide</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="mb-4 rounded-2xl bg-white py-5"
            activeOpacity={0.8}>
            <Text className="text-center text-xl font-bold text-blue-600">Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            className="mb-6 rounded-2xl border-2 border-white bg-transparent py-5"
            activeOpacity={0.8}>
            <Text className="text-center text-xl font-bold text-white">Login</Text>
          </TouchableOpacity>

          <Text className="text-center text-sm text-white/80">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LandingPage;
