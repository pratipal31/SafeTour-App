// Profile.tsx
import { View, Text, TextInput, Pressable, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SignOutButton } from '@/components/SignOutButton';

const Profile = () => {
  const [contact, setContact] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!/^\+?[0-9]{10,15}$/.test(contact)) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    try {
      await AsyncStorage.setItem('emergencyContact', contact);
      if (name) await AsyncStorage.setItem('userName', name);
      if (email) await AsyncStorage.setItem('userEmail', email);
      setTimeout(() => {
        setLoading(false);
        Alert.alert('Saved', 'Profile updated successfully!');
      }, 500);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save profile.');
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header Section */}
      <View className="items-center px-6 pb-6 pt-16 bg-white border-b border-gray-100">
        <View className="mb-4">
          <View 
            className="w-24 h-24 rounded-full bg-blue-600 justify-center items-center border-4 border-blue-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-4xl font-bold text-white">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
        </View>
        <Text className="text-2xl font-bold text-gray-900 mb-1">My Profile</Text>
        <Text className="text-sm text-gray-500">Manage your personal information</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Form */}
        <View className="px-6 py-6">
          {/* Account Information Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Account Information</Text>
            
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Full Name</Text>
              <TextInput
                className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm bg-white text-gray-900"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View className="mb-0">
              <Text className="text-sm font-medium text-gray-700 mb-2">Email Address</Text>
              <TextInput
                className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm bg-white text-gray-900"
                placeholder="your.email@example.com"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Emergency Contact Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-full bg-red-50 justify-center items-center mr-3 border border-red-100">
                <Text className="text-xl">🚨</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">Emergency Contact</Text>
                <Text className="text-xs text-gray-500">Required for SOS alerts</Text>
              </View>
            </View>
            
            <View className="bg-amber-50 rounded-lg p-3 mb-4 border border-amber-200">
              <Text className="text-xs text-amber-800 leading-4">
                This contact will be notified in case of emergency
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Phone Number</Text>
              <TextInput
                className="w-full h-12 border border-gray-300 rounded-lg px-4 text-sm bg-white text-gray-900"
                placeholder="+1234567890"
                keyboardType="phone-pad"
                value={contact}
                onChangeText={setContact}
                maxLength={15}
                placeholderTextColor="#9ca3af"
              />
              <Text className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</Text>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            className={`rounded-xl py-4 items-center mb-6 ${
              loading ? 'bg-gray-400' : 'bg-blue-600'
            }`}
            onPress={handleSave}
            disabled={loading}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: loading ? 0.05 : 0.1,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text className="text-white text-base font-semibold">
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>

          {/* Additional Info Card */}
          <View className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
            <View className="flex-row items-start">
              <View className="w-8 h-8 rounded-full bg-white justify-center items-center mr-3">
                <Text className="text-lg">ℹ️</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-blue-900 mb-1">Data Privacy</Text>
                <Text className="text-xs text-blue-700 leading-4">
                  Your information is securely stored and only used for emergency situations. We never share your data with third parties.
                </Text>
              </View>
            </View>
          </View>

          {/* Sign Out Section */}
          <SignOutButton />
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;