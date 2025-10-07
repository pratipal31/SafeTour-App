import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useState } from 'react'

export const SignOutButton = () => {
  const { signOut } = useClerk()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    try {
      // Show confirmation dialog
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: async () => {
              try {
                setIsSigningOut(true);
                
                console.log('Starting sign out process...');
                
                // Clear local storage
                await AsyncStorage.clear();
                console.log('Local storage cleared');
                
                // Sign out from Clerk
                await signOut();
                console.log('Clerk sign out complete');
                
                // Small delay to ensure Clerk state updates
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Redirect to landing page
                console.log('Redirecting to landing page...');
                router.replace('/');
              } catch (error) {
                console.error('Error during sign out:', error);
                setIsSigningOut(false);
                Alert.alert('Error', 'Failed to sign out. Please try again.');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Sign out error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', 'An error occurred during sign out.');
    }
  }

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      disabled={isSigningOut}
      className={`px-5 py-3 rounded-xl mt-20 items-center ${isSigningOut ? 'bg-purple-400' : 'bg-purple-600'}`}
    >
      {isSigningOut ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-white text-base font-semibold">
          Sign out
        </Text>
      )}
    </TouchableOpacity>
  )
}
