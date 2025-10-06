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
    <ScrollView className="flex-1 bg-slate-100">
      <View className="flex-1">
        {/* Header Section */}
        <View className="items-center px-6 pb-8 pt-16 bg-white rounded-b-[32px] shadow-sm">
          <View className="mb-4">
            <View className="w-24 h-24 rounded-full bg-blue-600 justify-center items-center shadow-lg"
              style={{
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <Text className="text-5xl font-bold text-white">
                {name ? name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          </View>
          <Text className="text-4xl font-bold text-slate-800 mb-1">My Profile</Text>
          <Text className="text-base text-slate-500">Manage your personal information</Text>
        </View>

        {/* Profile Form */}
        <View className="p-6 mt-2">
          <View className="mb-6">
            <Text className="text-base font-semibold text-slate-700 mb-2">Full Name</Text>
            <TextInput
              className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-base bg-white text-slate-800"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-slate-700 mb-2">Email Address</Text>
            <TextInput
              className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-base bg-white text-slate-800"
              placeholder="your.email@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-slate-700 mb-2">Emergency Contact</Text>
            <Text className="text-xs text-slate-500 mb-2">
              This contact will be notified in case of emergency
            </Text>
            <TextInput
              className="w-full h-14 border-2 border-slate-300 rounded-xl px-4 text-base bg-white text-slate-800"
              placeholder="+1234567890"
              keyboardType="phone-pad"
              value={contact}
              onChangeText={setContact}
              maxLength={15}
              placeholderTextColor="#94a3b8"
            />
          </View>

          <Pressable
            className={`rounded-xl py-4 items-center mt-2 ${
              loading ? 'bg-slate-400' : 'bg-blue-600'
            }`}
            onPress={handleSave}
            disabled={loading}
            style={{
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: loading ? 0.1 : 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="text-white text-lg font-bold tracking-wide">
              {loading ? 'Saving...' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>

        {/* Sign Out Section */}
        <View className="px-6 pt-2 pb-8">
          <SignOutButton />
        </View>
      </View>
    </ScrollView>
  );
};

export default Profile;