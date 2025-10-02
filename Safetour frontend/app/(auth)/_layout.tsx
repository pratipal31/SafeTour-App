import { Redirect, Stack } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { StackScreen } from 'react-native-screens'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/(tabs)'} />
  }
    
  

  return <Stack>
    <Stack.Screen name="login" options={{ headerShown: false }} />
    <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
}