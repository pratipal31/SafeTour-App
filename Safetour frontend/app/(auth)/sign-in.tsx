import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { OAuthButtons }  from '@/components/OAuthButton' // 👈 import your Google button

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')

  const onSignInPress = async () => {
    if (!isLoaded) return

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      })

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/(tabs)/home')
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      <Text className="text-3xl font-bold mb-6 text-gray-800">Sign in</Text>

      {/* Email Input */}
      <TextInput
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        onChangeText={setEmailAddress}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
      />

      {/* Password Input */}
      <TextInput
        value={password}
        placeholder="Enter password"
        secureTextEntry
        onChangeText={setPassword}
        className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
      />

      {/* Email/Password Continue Button */}
      <TouchableOpacity
        onPress={onSignInPress}
        className="w-full bg-purple-500 py-3 rounded-lg mb-4"
      >
        <Text className="text-center text-white font-semibold text-lg">
          Continue
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <Text className="text-gray-500 my-2">or</Text>

      {/* Google OAuth Button */}
      <OAuthButtons />

      {/* Redirect to Sign Up */}
      <View className="flex-row justify-center items-center mt-2">
        <Text className="text-gray-600 mr-1">Don't have an account?</Text>
        <Link href="/sign-up" asChild>
          <TouchableOpacity>
            <Text className="text-purple-600 font-semibold">Sign up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  )
}
