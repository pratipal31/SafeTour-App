import * as React from 'react'
import { Text, TextInput, TouchableOpacity, View, Alert } from 'react-native'
import { Link, useRouter } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function SignUpScreen() {
  const router = useRouter()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const onSignUpPress = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        Alert.alert('Error', error.message)
      } else if (data.session) {
        router.replace('/(tabs)/home')
      } else {
        Alert.alert('Success', 'Account created! Please sign in.')
        router.replace('/sign-in')
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
      <Text className="text-3xl font-bold mb-6 text-gray-800">Sign up</Text>

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
        secureTextEntry={true}
        onChangeText={setPassword}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
      />

      <TouchableOpacity
        onPress={onSignUpPress}
        disabled={loading}
        className="w-full bg-blue-500 py-3 rounded-lg mb-4"
      >
        <Text className="text-center text-white font-semibold text-lg">
          {loading ? 'Creating account...' : 'Sign up'}
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 mr-1">Already have an account?</Text>
        <Link href="/sign-in" asChild>
          <TouchableOpacity>
            <Text className="text-blue-600 font-semibold">Sign in</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
