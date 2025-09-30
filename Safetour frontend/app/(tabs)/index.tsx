import { images } from "@/constants/images";
import { Text,ScrollView, View,Image } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="absolute w-full z-0"/>
      <ScrollView className="flex-1 px-5" >
      
      </ScrollView>
    </View>
  );
}
