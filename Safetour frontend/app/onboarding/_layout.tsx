import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function OnboardingLayout() {
  const { isSignedIn } = useAuth();

  // Protect onboarding routes - only accessible when signed in
  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack>
      <Stack.Screen
        name="aadhar-upload"
        options={{
          headerShown: true,
          title: "Aadhaar Upload",
          headerBackVisible: false, // Prevent going back during onboarding
        }}
      />
    </Stack>
  );
}