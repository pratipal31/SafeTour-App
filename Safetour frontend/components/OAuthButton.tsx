import React, { useCallback, useEffect } from 'react'
import { View, TouchableOpacity, Text, Alert, Platform, Image } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { syncUserToSupabase } from '@/lib/userSync'
import { supabase } from '@/lib/supabase'

// Preloads the browser for Android devices to reduce authentication load time
export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return
    void WebBrowser.warmUpAsync()
    return () => {
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

export function OAuthButtons() {
  const { startSSOFlow } = useSSO()
  const router = useRouter()

  useWarmUpBrowser()

  const handleSSO = useCallback(
    async (strategy: 'oauth_google' | 'oauth_github' | string) => {
      try {
        // Build a redirect URI appropriate for the platform
        const redirectUrl = AuthSession.makeRedirectUri({ 
          scheme: 'safetour', 
          path: 'sign-in-callback' 
        })

        const result = await startSSOFlow({ strategy: strategy as any, redirectUrl })

        const { createdSessionId, setActive, signIn, signUp } = result || {}

        if (createdSessionId) {
          // Set the active session first
          await setActive!({ session: createdSessionId })

          // Get user data from the result
          let userId: string | undefined
          let userEmail: string | undefined
          let firstName: string | null = null
          let lastName: string | null = null
          let imageUrl: string | undefined

          if (signUp) {
            userId = signUp.createdUserId
            userEmail = signUp.emailAddress
            firstName = signUp.firstName || null
            lastName = signUp.lastName || null
          } else if (signIn) {
            userId = signIn.userData?.id
            userEmail = signIn.userData?.emailAddresses?.[0]?.emailAddress
            firstName = signIn.userData?.firstName || null
            lastName = signIn.userData?.lastName || null
            imageUrl = signIn.userData?.imageUrl
          }

          if (userId) {
            // Sync user to Supabase (creates or updates user)
            await syncUserToSupabase({
              id: userId,
              emailAddresses: userEmail ? [{ emailAddress: userEmail }] : [],
              firstName,
              lastName,
              imageUrl,
            })

            // Check if user has uploaded aadhar
            const { data: userData, error } = await supabase
              .from('users')
              .select('aadhar_url')
              .eq('id', userId)
              .single()

            if (error && error.code !== 'PGRST116') {
              console.error('Error checking aadhar status:', error)
            }

            // Redirect based on aadhar status
            if (userData?.aadhar_url) {
              router.replace('/(tabs)/home')
            } else {
              router.replace('/onboarding/aadhar-upload')
            }
          } else {
            // Fallback navigation if userId is not available
            router.replace('/(tabs)/home')
          }
        } else {
          // Missing requirements like MFA may be returned via signIn or signUp
          console.log('SSO did not create a session, possible missing requirements', { 
            signIn, 
            signUp 
          })
          Alert.alert('Authentication', 'Additional steps required to complete sign-in')
        }
      } catch (err: any) {
        console.error('SSO start failed', err)
        Alert.alert('Authentication error', err?.message || 'SSO failed')
      }
    },
    [startSSOFlow, router],
  )

  return (
    <View style={{ width: '100%', gap: 12 }}>
      {/* Google Button */}
      <TouchableOpacity
        onPress={() => handleSSO('oauth_google')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#fff',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#ccc',
        }}
      >
        <Image
          source={require('@/assets/images/google.png')}
          style={{ width: 20, height: 20, marginRight: 10 }}
          resizeMode="contain"
        />
        <Text style={{ color: '#000', fontWeight: '600', flex: 1, textAlign: 'center' }}>
          Sign in with Google
        </Text>
      </TouchableOpacity>

      {/* GitHub Button */}
      <TouchableOpacity
        onPress={() => handleSSO('oauth_github')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#24292E',
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Image
          source={require('@/assets/images/github.png')}
          style={{ width: 20, height: 20, marginRight: 10, tintColor: '#fff' }}
          resizeMode="contain"
        />
        <Text style={{ color: '#fff', fontWeight: '600', flex: 1, textAlign: 'center' }}>
          Sign in with GitHub
        </Text>
      </TouchableOpacity>
    </View>
  )
}