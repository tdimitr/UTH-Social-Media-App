import React from "react";
import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import { useRouter } from "expo-router";
import InitialsAvatar from "../context/InitialAvatars";

export default function UserHeader({ user, activeTab, setActiveTab }) {
  const router = useRouter();

  // Function to open the URL in the browser
  const handleOpenURL = () => {
    Linking.openURL("https://www.e-ce.uth.gr/");
  };

  return (
    <View className="p-4 bg-white">
      {/* Header with Name and Profile Picture */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-2xl font-bold">{user.name}</Text>
          <Text className="text-gray-500">@{user.username}</Text>
        </View>
        {/* Check if profilePic exists, if not, display InitialsAvatar */}
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

      {/* Follow/Update Button */}
      <TouchableOpacity
        className="bg-slate-100 py-2 px-4 rounded-md items-center mb-4 self-start"
        onPress={() => router.push("/updateProfile")}
      >
        <Text className="text-black font-bold text-sm">Update Profile</Text>
      </TouchableOpacity>

      {/* Followers Count and External Link */}
      <View className="flex-row items-center justify-start mb-4">
        <Text className="text-gray-500">{user.followers.length} followers</Text>
        <View className="w-1 h-1 bg-gray-400 rounded-full mx-2"></View>
        <TouchableOpacity onPress={handleOpenURL}>
          <Text className="text-slate-400 underline">e-ce.uth.gr</Text>
        </TouchableOpacity>
      </View>

      {/* Posts and Replies Tabs */}
      <View className="flex-row mt-1 border-b border-gray-200">
        {/* Posts Tab */}
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

        {/* Replies Tab */}
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
