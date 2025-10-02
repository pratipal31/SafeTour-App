import { images } from "@/constants/images";
import { Text,ScrollView, View,Image } from "react-native";
import SearchBar from "@/components/SearchBar";
import { useRouter } from "expo-router";
import LandingPage from "@/components/LandingPage";

export default function Index() {
  const router=useRouter();
  return (
    <View className="flex-1 bg-white">
      <ScrollView className="flex-1" >
      <View className="flex-1">
        <LandingPage/>
      </View>
      </ScrollView>
    </View>
  );
}
