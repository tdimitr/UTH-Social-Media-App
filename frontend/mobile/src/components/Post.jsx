import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { formatDistanceToNow } from "date-fns";
import InitialsAvatar from "../context/InitialAvatars";
import HomeActions from "./HomeActions";
import { useRouter } from "expo-router";
import Actions from "./Actions";

export default function Post({ post, postedBy }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(
          `http://192.168.1.6:5000/api/users/profile/${postedBy}`
        );
        const data = await res.json();
        if (data.error) {
          console.error(data.error);
          return;
        }
        setUser(data);
      } catch (error) {
        console.error(error.message);
        setUser(null);
      }
    };
    getUser();
  }, [postedBy]);

  if (!user) {
    return null;
  }

  const timeAgo = formatDistanceToNow(new Date(post.createdAt)) + " ago";

  return (
    <View className="bg-white py-5">
      <View className="flex-row gap-3 px-4">
        {/* Avatar Section */}
        <View className="items-center">
          <TouchableOpacity
            onPress={() => router.push(`/profile/${user.username}`)}
          >
            {user.profilePic ? (
              <Image
                source={{ uri: user.profilePic }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <InitialsAvatar name={user.username} size={48} />
            )}
          </TouchableOpacity>
          <View className="w-0.5 flex-grow bg-gray-200 my-2"></View>
        </View>

        {/* Post Content */}
        <View className="flex-1 gap-2">
          {/* Header */}
          <View className="flex-row justify-between items-center">
            <TouchableOpacity
              onPress={() => router.push(`/profile/${user.username}`)}
            >
              <Text className="font-bold text-sm">{user.username}</Text>
            </TouchableOpacity>
            <Text className="text-xs text-gray-400">{timeAgo}</Text>
          </View>

          {/* Post Text */}
          <TouchableOpacity onPress={() => router.push(`/posts/${post._id}`)}>
            <Text className="text-sm text-gray-700">{post.text}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(`/posts/${post._id}`)}>
            {/* Post Image */}
            {post.img && (
              <View className="rounded-lg overflow-hidden border border-gray-200">
                <Image
                  source={{ uri: post.img }}
                  className="w-full aspect-[4/3]"
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Actions Section */}
          <Actions
            postId={post._id}
            likesCount={post.likes.length}
            repliesCount={post.replies.length}
            likesArray={post.likes}
          />
        </View>
      </View>
    </View>
  );
}
