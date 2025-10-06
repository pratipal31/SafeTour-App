import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import LandingPage from "@/components/LandingPage";

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  if (isLoaded && isSignedIn) {
    return <Redirect href="/(tabs)/home" />
  }
  return <LandingPage />;
}