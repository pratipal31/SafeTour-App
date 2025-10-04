import * as React from 'react'
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useSignUp, useUser } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { OAuthButtons } from '@/components/OAuthButton'
import { syncUserToSupabase } from '@/lib/userSync'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')

  const onSignUpPress = async () => {
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress,
        password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const onVerifyPress = async () => {
    if (!isLoaded) return

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code })

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })

        // Sync user to Supabase after successful signup
        if (signUpAttempt.createdUserId) {
          const clerkUser = {
            id: signUpAttempt.createdUserId,
            emailAddresses: [{ emailAddress }],
            firstName: null,
            lastName: null,
            imageUrl: undefined,
          }
          await syncUserToSupabase(clerkUser)
        }

        router.replace('/(tabs)/home')
      } else {
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-xl font-semibold mb-4 text-gray-800">Verify your email</Text>
          <TextInput
            value={code}
            placeholder="Enter your verification code"
            onChangeText={(code) => setCode(code)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
          />
          <TouchableOpacity
            onPress={onVerifyPress}
            className="w-full bg-purple-500 py-3 rounded-lg"
          >
            <Text className="text-center text-white font-semibold text-lg">Verify</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6 flex-row items-center justify-center">
          <Text className="text-3xl font-bold text-gray-800">Sign Up</Text>
          <Image
            source={require('@/assets/images/logo.png')}
            className="mr-2 h-10 w-10"
            resizeMode="contain"
          />
        </View>

        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={(email) => setEmailAddress(email)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        />

        <TextInput
          value={password}
          placeholder="Enter password"
          secureTextEntry={true}
          onChangeText={(password) => setPassword(password)}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
        />

        <TouchableOpacity
          onPress={onSignUpPress}
          className="w-full bg-purple-500 py-3 rounded-lg mb-4"
        >
          <Text className="text-center text-white font-semibold text-lg">Continue</Text>
        </TouchableOpacity>

        <Text className="text-gray-500 my-2 text-center">or</Text>

        {/* Google OAuth Button */}
        <OAuthButtons />

        <View className="mt-2 flex-row items-center justify-center">
          <Text className="text-gray-600 mr-1">Already have an account?</Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text className="text-purple-600 font-semibold">Sign in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}