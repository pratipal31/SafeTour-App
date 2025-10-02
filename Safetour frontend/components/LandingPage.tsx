import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'

const LandingPage = () => {

  const router =useRouter();  
  const handleLogin = () => {
    router.push("/login")
    
  }

  const handleSignUp = () => {
    router.push("/signup")
  }

  return (
    <SafeAreaView className="flex-1 bg-blue-600">
      <View className="flex-1 px-8 py-12 justify-between">
        {/* Header Section */}
        <View className="items-center mt-16">
          <View className="bg-white/20 rounded-full px-6 py-2 mb-6">
            <Text className="text-white text-xs font-semibold tracking-widest">
              YOUR TRAVEL COMPANION
            </Text>
          </View>
          
          <Text className="text-white text-6xl font-bold text-center mb-6">
            SafeTour
          </Text>
          
          <Text className="text-white/90 text-xl text-center leading-8 px-6 mt-2">
            Explore the world with confidence. Your safety, our priority.
          </Text>
        </View>

        {/* Feature Icons Section */}
        <View className="flex-row justify-around px-2 my-8">
          <View className="items-center">
            <View className="bg-white/20 rounded-2xl w-20 h-20 items-center justify-center mb-3">
              <Text className="text-4xl">🛡️</Text>
            </View>
            <Text className="text-white text-sm font-semibold">Secure</Text>
          </View>
          
          <View className="items-center">
            <View className="bg-white/20 rounded-2xl w-20 h-20 items-center justify-center mb-3">
              <Text className="text-4xl">🌍</Text>
            </View>
            <Text className="text-white text-sm font-semibold">Global</Text>
          </View>
          
          <View className="items-center">
            <View className="bg-white/20 rounded-2xl w-20 h-20 items-center justify-center mb-3">
              <Text className="text-4xl">⚡</Text>
            </View>
            <Text className="text-white text-sm font-semibold">Fast</Text>
          </View>
          
          <View className="items-center">
            <View className="bg-white/20 rounded-2xl w-20 h-20 items-center justify-center mb-3">
              <Text className="text-4xl">💼</Text>
            </View>
            <Text className="text-white text-sm font-semibold">Reliable</Text>
          </View>
        </View>

        {/* Bottom Section with Buttons */}
        <View className="mb-6">
          {/* Benefits List */}
          <View className="bg-white/15 rounded-3xl p-8 mb-8">
            <View className="flex-row items-center mb-5">
              <Text className="text-white text-2xl mr-3">✓</Text>
              <Text className="text-white text-lg">Real-time safety alerts</Text>
            </View>
            <View className="flex-row items-center mb-5">
              <Text className="text-white text-2xl mr-3">✓</Text>
              <Text className="text-white text-lg">Emergency assistance 24/7</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-white text-2xl mr-3">✓</Text>
              <Text className="text-white text-lg">Trusted by millions worldwide</Text>
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-white rounded-2xl py-5 mb-4"
            activeOpacity={0.8}
          >
            <Text className="text-blue-600 text-center text-xl font-bold">
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            className="bg-transparent border-2 border-white rounded-2xl py-5 mb-6"
            activeOpacity={0.8}
          >
            <Text className="text-white text-center text-xl font-bold">
              Login
            </Text>
          </TouchableOpacity>

          <Text className="text-white/80 text-center text-sm">
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default LandingPage