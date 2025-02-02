import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Modal,
  TextInput,
  Button,
  Alert,
  Pressable,
} from "react-native";
import { AntDesign, Ionicons, Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import * as Clipboard from "expo-clipboard";

export default function Actions({
  postId,
  likesCount,
  repliesCount,
  likesArray,
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount);

  useEffect(() => {
    const checkIfLiked = async () => {
      try {
        const userInfo = await SecureStore.getItemAsync("userInfo");
        if (userInfo) {
          const userId = JSON.parse(userInfo)._id;
          setIsLiked(likesArray.includes(userId));
        }
      } catch (error) {
        console.error("Error checking likes:", error);
      }
    };

    checkIfLiked();
  }, [likesArray]);

  // Handle Like Button Click
  const handleLike = async () => {
    const token = await SecureStore.getItemAsync("userToken");

    try {
      const response = await fetch(
        `http://192.168.1.6:5000/api/posts/like/${postId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        if (data.message === "Post liked successfully") {
          setIsLiked(true);
          setCurrentLikesCount((prev) => prev + 1);
        } else if (data.message === "Post unliked successfully") {
          setIsLiked(false);
          setCurrentLikesCount((prev) => Math.max(0, prev - 1));
        }
      } else {
        console.error("Failed to like/unlike post:", data);
      }
    } catch (error) {
      console.error("Like/Unlike error:", error);
    }
  };

  // Handle Comment Button Click
  const handleComment = () => {
    setIsCommenting(true);
  };

  // Handle Comment Submit
  const submitComment = async () => {
    if (!commentText) return; // Prevent submitting empty comment
    const token = await SecureStore.getItemAsync("userToken");

    try {
      await fetch(`http://192.168.1.5:5000/api/posts/reply/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Platform": "mobile",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: commentText }),
      });
      setIsCommenting(false); // Close modal
      setCommentText(""); // Clear text input
    } catch (error) {
      console.error("Comment error:", error);
    }
  };

  // Handle Share Button Click
  const handleShare = () => {
    setIsSharing(true);
  };

  // Copy URL to Clipboard
  const handleCopyURL = () => {
    Clipboard.setString(`http://your-app-url.com/posts/${postId}`);
    Alert.alert("Copied", "Post URL has been copied to clipboard.");
  };

  return (
    <View className="px-4 py-2">
      {/* Action Icons */}
      <View className="flex-row gap-6 mt-2">
        {/* Like Button */}
        <TouchableOpacity onPress={handleLike}>
          <AntDesign
            name={isLiked ? "heart" : "hearto"}
            size={20}
            color={isLiked ? "red" : "black"}
          />
        </TouchableOpacity>

        {/* Comment Button */}
        <TouchableOpacity onPress={handleComment}>
          <Ionicons name="chatbubble-outline" size={20} color="black" />
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity onPress={handleShare}>
          <Feather name="send" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Likes and Replies Count */}
      <View className="flex-row gap-4 mt-1 items-center justify-start">
        <Text className="text-xs text-gray-500">{currentLikesCount} likes</Text>
        <Text className="text-xs text-gray-500">•</Text>
        <Text className="text-xs text-gray-500">{repliesCount} replies</Text>
      </View>

      {/* comment modal */}
      <Modal
        visible={isCommenting}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCommenting(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable
            className="flex-1"
            onPress={() => setIsCommenting(false)}
          />

          <View className="bg-white rounded-t-2xl p-6">
            <View className="flex-row items-center border border-gray-300 rounded-md p-2">
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Write a comment..."
                multiline
                className="flex-1 text-base"
              />
              <TouchableOpacity
                className="ml-2 bg-blue-200 rounded-md px-4 py-2"
                onPress={submitComment}
              >
                <Text className="text-blue-600 font-medium">Reply</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="mt-6 flex-row justify-center items-center"
              onPress={() => setIsCommenting(false)}
            >
              <AntDesign name="closecircle" size={24} color="red" />
              <Text className="ml-2 text-red-500 font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* share modal */}
      <Modal
        visible={isSharing}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSharing(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <Pressable className="flex-1" onPress={() => setIsSharing(false)} />

          <View className="bg-white rounded-t-2xl p-6">
            <Text className="text-lg font-bold mb-6 text-center">
              Share Post
            </Text>

            <View className="flex-row justify-evenly items-center">
              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-gray-200 justify-center items-center"
                onPress={handleCopyURL}
              >
                <Feather name="copy" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-gray-200 justify-center items-center"
                onPress={() => {}}
              >
                <Feather name="facebook" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-gray-200 justify-center items-center"
                onPress={() => {}}
              >
                <Feather name="twitter" size={24} color="black" />
              </TouchableOpacity>

              <TouchableOpacity
                className="w-16 h-16 rounded-full bg-gray-200 justify-center items-center"
                onPress={() => {}}
              >
                <Feather name="linkedin" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="mt-6 flex-row justify-center items-center"
              onPress={() => setIsSharing(false)}
            >
              <AntDesign name="closecircle" size={24} color="red" />
              <Text className="ml-2 text-red-500 font-bold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
