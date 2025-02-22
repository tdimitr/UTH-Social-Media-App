import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function OtherUserHeader({ user, activeTab, setActiveTab }) {
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch logged-in user's _id from SecureStore
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserInfo = await SecureStore.getItemAsync("userInfo");
      if (storedUserInfo) {
        const parsedUser = JSON.parse(storedUserInfo);
        setLoggedInUserId(parsedUser._id);

        // Check if logged-in user follows this profile
        setIsFollowing(user?.followers?.includes(parsedUser._id));
      }
    };

    fetchUserId();
  }, [user]);

  // Handle Follow/Unfollow action
  const handleFollowToggle = async () => {
    const token = await SecureStore.getItemAsync("userToken");

    try {
      const response = await fetch(
        `http://192.168.1.6:5000/api/users/follow/${user._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
        }
      );

      if (response.ok) {
        setIsFollowing((prev) => !prev);

        // Dynamically update the follower count
        user.followers.length = isFollowing
          ? user.followers.length - 1
          : user.followers.length + 1;
      } else {
        console.error("Error toggling follow status");
      }
    } catch (error) {
      console.error("Request failed:", error);
    }
  };

  return (
    <View className="p-4 bg-white">
      {/* Header with Name and Profile Picture */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-2xl font-bold">{user.name}</Text>
          <Text className="text-gray-500">@{user.username}</Text>
        </View>
        {user.profilePic ? (
          <Image
            source={{ uri: user.profilePic }}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <InitialsAvatar name={user.name} size={64} />
        )}
      </View>

      {/* Bio */}
      <Text className="text-sm text-gray-700 mb-4">{user.bio}</Text>

      {/* Follow/Unfollow Button */}
      {loggedInUserId && loggedInUserId !== user._id && (
        <TouchableOpacity
          className={`py-2 px-4 rounded-md items-center mb-4 self-start ${
            isFollowing ? "bg-white" : "bg-blue-500"
          }`}
          onPress={handleFollowToggle}
        >
          <Text
            className={`${isFollowing ? "text-black" : "text-white"} font-bold`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Followers Count and External Link */}
      <View className="flex-row items-center justify-start mb-4">
        <Text className="text-gray-500">{user.followers.length} followers</Text>
        <View className="w-1 h-1 bg-gray-400 rounded-full mx-2"></View>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://www.e-ce.uth.gr/")}
        >
          <Text className="text-slate-400 underline">e-ce.uth.gr</Text>
        </TouchableOpacity>
      </View>

      {/* Posts and Replies Tabs */}
      <View className="flex-row mt-1 border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 items-center pb-3 ${
            activeTab === "posts" ? "border-b-2 border-black" : ""
          }`}
          onPress={() => setActiveTab("posts")}
        >
          <Text
            className={`font-bold ${
              activeTab === "posts" ? "text-black" : "text-slate-400"
            }`}
          >
            Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center pb-3 ${
            activeTab === "replies" ? "border-b-2 border-black" : ""
          }`}
          onPress={() => setActiveTab("replies")}
        >
          <Text
            className={`font-bold ${
              activeTab === "replies" ? "text-black" : "text-slate-400"
            }`}
          >
            Replies
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
