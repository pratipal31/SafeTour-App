import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

const Profile = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-2xl font-bold mb-4">Profile</Text>
      {user && (
        <Text className="text-gray-600 mb-6">Email: {user.email}</Text>
      )}
      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500 py-3 px-6 rounded-lg"
      >
        <Text className="text-white font-semibold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Profile;
