import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import { formatDistanceToNow } from "date-fns";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as SecureStore from "expo-secure-store";
import Actions from "./Actions";
import { useRouter } from "expo-router";

export default function PostListItem({ user, post, setPosts }) {
  const router = useRouter();
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const timeAgo = formatDistanceToNow(new Date(post.createdAt)) + " ago";

  const handleDeletePost = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) throw new Error("Token not found");

      const res = await fetch(
        `http://192.168.1.6:5000/api/posts/delete/${post._id}`,
        {
          method: "DELETE",
          headers: {
            "X-Platform": "mobile",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== post._id));
      } else {
        console.error("Failed to delete post:", data.error);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeleteModalVisible(false);
    }
  };

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
              <TouchableOpacity onPress={() => setDeleteModalVisible(true)}>
                <Ionicons name="trash" size={16} color="black" />
              </TouchableOpacity>
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

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={isDeleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-80">
            <Text className="text-lg font-bold">Delete Post</Text>
            <Text className="text-gray-500 mt-2">
              Are you sure you want to delete this post?
            </Text>

            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                className="px-4 py-2 bg-red-600 rounded-lg flex-1 mr-2"
                onPress={handleDeletePost}
              >
                <Text className="text-white text-center">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 border border-gray-300 rounded-lg flex-1 ml-2"
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text className="text-black text-center">Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
