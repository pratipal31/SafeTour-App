import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import React from 'react'
import { supabase } from '@/lib/supabase'

export default function SignInScreen() {
  const router = useRouter()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onSignInPress = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        Alert.alert('Error', error.message)
      } else if (data.session) {
        router.replace('/(tabs)/home')
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-bold mb-6 text-gray-800">Sign in</Text>

      <TextInput
        autoCapitalize="none"
        value={email}
        placeholder="Enter email"
        onChangeText={setEmail}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
      />

      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry
        onChangeText={setPassword}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
      />

      <TouchableOpacity
        onPress={onSignInPress}
        disabled={loading}
        className="w-full bg-blue-500 py-3 rounded-lg mb-4"
      >
        <Text className="text-center text-white font-semibold text-lg">
          {loading ? 'Signing in...' : 'Sign in'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center items-center mt-2">
        <Text className="text-gray-600 mr-1">Don't have an account?</Text>
        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text className="text-blue-600 font-semibold">Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
