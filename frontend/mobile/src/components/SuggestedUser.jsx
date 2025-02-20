import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import InitialsAvatar from "../context/InitialAvatars";

export default function SuggestedUser({ user }) {
  const router = useRouter();
  const { handleFollowUnfollow, updating, following } = useFollowUnfollow(user);

  return (
    <View className="flex-row justify-between items-center py-4">
      {/* Left side: Avatar and User Info */}
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.push(`/profile/${user.username}`)}
        >
          {user.profilePic ? (
            <Image
              source={{ uri: user.profilePic }}
              className="w-12 h-12 rounded-full mr-4"
            />
          ) : (
            <View className="mr-4">
              <InitialsAvatar name={user.username} size={48} />
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push(`/profile/${user.username}`)}
        >
          <Text className="text-lg font-bold">{user.username}</Text>
        </TouchableOpacity>
      </View>

      {/* Right side: Follow/Unfollow Button */}
      <TouchableOpacity
        className={`py-2 px-6 rounded-md ${
          following ? "bg-white" : "bg-blue-500"
        }`}
        onPress={handleFollowUnfollow}
        disabled={updating}
      >
        {updating ? (
          <ActivityIndicator size="small" color="#000000" />
        ) : (
          <Text
            className={`${following ? "text-black" : "text-white"} font-bold`}
          >
            {following ? "Unfollow" : "Follow"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
