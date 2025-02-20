import { useEffect, useState } from "react";
import { View, Image, Text, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import { Redirect } from "expo-router";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserInfo = await SecureStore.getItemAsync("userInfo");
        const storedUserToken = await SecureStore.getItemAsync("userToken");

        if (storedUserInfo && storedUserToken) {
          setUserInfo(JSON.parse(storedUserInfo));
          setUserToken(storedUserToken);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const delay = setTimeout(async () => {
      await fetchUserData();
      setLoading(false);
    }, 2000); // Set delay to 2 seconds

    return () => clearTimeout(delay); // Cleanup timeout on component unmount
  }, []);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Image
          source={{
            uri: "https://www.uth.gr/sites/default/files/contents/logos/UTH-logo-english.png",
          }}
          className="w-24 h-24 mb-5"
        />
        <Text className="font-bold mb-5 text-center">
          UTH - Social Media App
        </Text>

        <ActivityIndicator size="large" color="#ff0000" className="mt-5" />

        <Text className="text-gray-500 text-xs mt-5">
          Built by Tsapalas Dimitrios-Nikolaos © 2025
        </Text>
      </View>
    );
  }

  if (userInfo && userToken) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)" />;
  }
}
