import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import LandingPage from "@/components/LandingPage";
import { useEffect } from "react";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  
  useEffect(() => {
    console.log('Index page - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);
  }, [isLoaded, isSignedIn]);

  // Wait for Clerk to load before making routing decisions
  if (!isLoaded) {
    return null; // or a loading spinner
  }

  // If user is signed in, redirect to home
  if (isSignedIn) {
    return <Redirect href="/(tabs)/home" />
  }

  // If user is not signed in, show landing page
  return <LandingPage />;
}