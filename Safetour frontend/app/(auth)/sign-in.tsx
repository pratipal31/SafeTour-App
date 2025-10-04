import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React from 'react';
import { OAuthButtons } from '@/components/OAuthButton';
import { syncUserToSupabase } from '@/lib/userSync';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = React.useState('');
  const [password, setPassword] = React.useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });

        // Sync user to Supabase after successful sign in
        if (signInAttempt.userData) {
          const clerkUser = {
            id: signInAttempt.userData.id,
            emailAddresses: signInAttempt.userData.emailAddresses,
            firstName: signInAttempt.userData.firstName,
            lastName: signInAttempt.userData.lastName,
            imageUrl: signInAttempt.userData.imageUrl,
          }
          await syncUserToSupabase(clerkUser)
        }

        router.replace('/(tabs)/home');
      } else {
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

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
          <Text className="text-3xl font-bold text-gray-800">Sign in</Text>
          <Image
            source={require('@/assets/images/logo.png')}
            className="mr-2 h-10 w-10"
            resizeMode="contain"
          />
        </View>

        {/* Email Input */}
        <TextInput
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          onChangeText={setEmailAddress}
          className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
        />

        {/* Password Input */}
        <TextInput
          value={password}
          placeholder="Enter password"
          secureTextEntry
          onChangeText={setPassword}
          className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-3 text-base"
        />

        {/* Email/Password Continue Button */}
        <TouchableOpacity
          onPress={onSignInPress}
          className="mb-4 w-full rounded-lg bg-purple-500 py-3"
        >
          <Text className="text-center text-lg font-semibold text-white">Continue</Text>
        </TouchableOpacity>

        {/* Divider */}
        <Text className="my-2 text-gray-500 text-center">or</Text>

        {/* Google OAuth Button */}
        <OAuthButtons />

        {/* Redirect to Sign Up */}
        <View className="mt-2 flex-row items-center justify-center">
          <Text className="mr-1 text-gray-600">Don't have an account?</Text>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text className="font-semibold text-purple-600">Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}