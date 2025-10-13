import { Redirect, Stack } from 'expo-router'
import { useAuth, useUser } from '@clerk/clerk-expo'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ActivityIndicator, View } from 'react-native'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()
  const { user } = useUser()
  const [checking, setChecking] = useState(true)
  const [hasAadhar, setHasAadhar] = useState(false)

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!isSignedIn || !user?.id) {
        setChecking(false)
        return
      }

      try {
        // Check if user exists in Supabase and has aadhar
        const { data, error } = await supabase
          .from('users')
          .select('aadhar_url')
          .eq('id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking user status:', error)
        }

        setHasAadhar(!!data?.aadhar_url)
      } catch (error) {
        console.error('Error in checkUserStatus:', error)
      } finally {
        setChecking(false)
      }
    }

    checkUserStatus()
  }, [isSignedIn, user?.id])

  if (isSignedIn) {
    if (checking) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      )
    }

    // Redirect based on aadhar status
    if (hasAadhar) {
      return <Redirect href="/(tabs)/home" />
    } else {
      return <Redirect href="/onboarding/aadhar-upload" />
    }
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
    </Stack>
  )
}