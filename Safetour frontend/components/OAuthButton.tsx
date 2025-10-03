import React, { useCallback, useEffect } from 'react'
import { View, TouchableOpacity, Text, Alert, Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { useSSO } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'

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
        // Build a redirect URI appropriate for the platform. For native we use the app scheme
        const redirectUrl = AuthSession.makeRedirectUri({ scheme: 'safetour', path: 'sign-in-callback' })

  const result = await startSSOFlow({ strategy: strategy as any, redirectUrl })

        const { createdSessionId, setActive, signIn, signUp } = result || {}

        if (createdSessionId) {
          // If authentication succeeded, set the active session and navigate home
          await setActive!({
            session: createdSessionId,
            navigate: async ({ session }) => {
              if (session?.currentTask) {
                router.push('/sign-in/tasks' as any)
                return
              }
              router.replace('/')
            },
          })
        } else {
          // Missing requirements like MFA may be returned via signIn or signUp
          console.log('SSO did not create a session, possible missing requirements', { signIn, signUp })
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
      <TouchableOpacity
        onPress={() => handleSSO('oauth_google')}
        style={{ backgroundColor: '#DB4437', padding: 12, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Sign in with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleSSO('oauth_github')}
        style={{ backgroundColor: '#24292E', padding: 12, borderRadius: 8 }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>Sign in with GitHub</Text>
      </TouchableOpacity>
    </View>
  )
}