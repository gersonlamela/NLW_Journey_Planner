import "@/styles/global.css";
import "@/utils/dayjsLocaleConfig";

import {
  View,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
} from "react-native";
import { Slot } from "expo-router";

import {
  useFonts,
  Inter_500Medium,
  Inter_400Regular,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import { Loading } from "@/components/loading";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-zinc-950">
      <SafeAreaView />
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Slot />
      <SafeAreaView />
    </View>
  );
}
