import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import InitialsAvatar from "../context/InitialAvatars";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";

export default function Comments({ replies, postId, setRepliesCount }) {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [replyList, setReplyList] = useState(replies);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReplyId, setSelectedReplyId] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const storedUserInfo = await SecureStore.getItemAsync("userInfo");
        const storedToken = await SecureStore.getItemAsync("userToken");
        if (storedUserInfo && storedToken) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          setUserId(parsedUserInfo._id);
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Error retrieving user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  const handleDeleteReply = async () => {
    if (!token || !selectedReplyId) return;

    try {
      const response = await fetch(
        `http://192.168.1.6:5000/api/posts/${postId}/reply/${selectedReplyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
        }
      );

      const data = await response.json();
      if (data.message) {
        setReplyList((prevReplies) => {
          const updatedReplies = prevReplies.filter(
            (reply) => reply._id !== selectedReplyId
          );
          setRepliesCount(updatedReplies.length);
          return updatedReplies;
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleteModalVisible(false);
      setSelectedReplyId(null);
    }
  };

  return (
    <View>
      <FlatList
        data={replyList}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="flex-row justify-between items-center p-4">
            <View className="flex-row gap-3">
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

              <View className="flex-1">
                <TouchableOpacity
                  onPress={() => router.push(`/profile/${item.username}`)}
                >
                  <Text className="font-bold text-sm">{item.username}</Text>
                </TouchableOpacity>
                <Text className="text-sm text-gray-700" numberOfLines={2}>
                  {item.text}
                </Text>
              </View>
            </View>

            {item.userId === userId && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedReplyId(item._id);
                  setDeleteModalVisible(true);
                }}
              >
                <Ionicons name="trash" size={16} color="black" />
              </TouchableOpacity>
            )}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={isDeleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-80">
            <Text className="text-lg font-bold">Delete Reply</Text>
            <Text className="text-gray-500 mt-2">
              Are you sure you want to delete this reply?
            </Text>

            <View className="flex-row justify-between mt-6">
              <TouchableOpacity
                className="px-4 py-2 bg-red-600 rounded-lg flex-1 mr-2"
                onPress={handleDeleteReply}
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
