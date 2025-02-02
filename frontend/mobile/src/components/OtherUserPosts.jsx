import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { formatDistanceToNow } from "date-fns";
import Actions from "./Actions";
import { useRouter } from "expo-router";

export default function PostListItem({ user, post }) {
  const router = useRouter();
  const timeAgo = formatDistanceToNow(new Date(post.createdAt)) + " ago";

  return (
    <View className="bg-white py-5">
      <View className="flex-row gap-3 px-4">
        <View className="items-center">
          <TouchableOpacity>
            <Image
              source={{ uri: user?.profilePic }}
              className="w-12 h-12 rounded-full"
            />
          </TouchableOpacity>
          <View className="w-0.5 flex-grow bg-gray-200 my-2"></View>
        </View>

        <View className="flex-1 gap-2">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity>
              <Text className="font-bold text-sm hover:underline">
                {user?.username}
              </Text>
            </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-400">{timeAgo}</Text>
            </View>
          </View>

          <TouchableOpacity onPress={() => router.push(`/posts/${post._id}`)}>
            <Text className="text-sm text-gray-700">{post.text}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push(`/posts/${post._id}`)}>
            {post.img && (
              <View className="rounded-lg overflow-hidden border border-gray-200">
                <Image
                  source={{ uri: post.img }}
                  className="w-full aspect-[4/3]"
                />
              </View>
            )}
          </TouchableOpacity>

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
