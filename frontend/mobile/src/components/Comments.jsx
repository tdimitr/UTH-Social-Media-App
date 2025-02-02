import React from "react";
import { View, FlatList, TouchableOpacity, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import InitialsAvatar from "../context/InitialAvatars";

export default function Comments({ replies }) {
  const router = useRouter();

  return (
    <FlatList
      data={replies}
      keyExtractor={(item) => item._id}
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
