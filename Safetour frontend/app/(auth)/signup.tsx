import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)

  const onSignInPress = async () => {
    if (!isLoaded) return
    setError(null) // reset error

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/profile') // redirect to main app
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2))
      setError(err?.errors?.[0]?.message || 'Sign in failed. Please try again.')
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-bold mb-8 text-gray-800">Sign in</Text>

      {error && (
        <Text className="text-red-500 mb-4 text-center">{error}</Text>
      )}

      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
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
        className="w-full bg-purple-500 py-3 rounded-lg mb-6"
      >
        <Text className="text-center text-white font-semibold text-lg">
          Continue
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center items-center">
        <Text className="text-gray-600 mr-1">Don’t have an account?</Text>
        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text className="text-purple-600 font-semibold">Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
