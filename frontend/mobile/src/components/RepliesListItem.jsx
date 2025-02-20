import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import InitialsAvatar from "../context/InitialAvatars"; // Import the InitialsAvatar component
import { router } from "expo-router"; // Import router

export default function RepliesListItem({ user, activeTab }) {
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);

  useEffect(() => {
    const fetchRepliesData = async () => {
      const token = await SecureStore.getItemAsync("userToken");

      try {
        const res = await fetch(
          `http://192.168.1.6:5000/api/posts/replies/${user.username}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "X-Platform": "mobile",
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setReplies(data);
        } else {
          console.error("Replies fetch error:", data.error);
        }
      } catch (error) {
        console.error("Network error:", error);
      } finally {
        setLoadingReplies(false);
      }
    };

    if (user) {
      fetchRepliesData();
    }
  }, [user, activeTab]);

  if (loadingReplies) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-4">Loading replies...</Text>
      </View>
    );
  }

  if (replies.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <Text className="text-xl font-bold">No Replies Yet</Text>
        <Text className="text-gray-500 mt-2">
          This user has not received any replies.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={replies}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View className="flex-row gap-3 p-4">
          {/* Clickable Avatar Section */}
          <TouchableOpacity
            onPress={() => router.push(`/profile/${item.username}`)}
          >
            {item.userProfilePic ? (
              <Image
                source={{ uri: item.userProfilePic }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <InitialsAvatar name={item.username} size={48} />
            )}
          </TouchableOpacity>

          {/* Reply Content */}
          <View className="flex-1">
            {/* Clickable Username */}
            <TouchableOpacity
              onPress={() => router.push(`/profile/${item.username}`)}
            >
              <Text className="font-bold text-sm">{item.username}</Text>
            </TouchableOpacity>

            {/* Reply Text */}
            <Text className="text-sm text-gray-700" numberOfLines={2}>
              {item.text}
            </Text>
          </View>
        </View>
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}
