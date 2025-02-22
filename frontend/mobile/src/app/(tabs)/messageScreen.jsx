import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
  format,
  isToday,
  isYesterday,
  formatDistanceToNowStrict,
} from "date-fns";
import * as SecureStore from "expo-secure-store";
import InitialsAvatar from "../../context/InitialAvatars";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSetRecoilState } from "recoil";
import selectedConversationAtom from "../atoms/selectedConversationAtom";
import Feather from "@expo/vector-icons/Feather";

const MessageScreen = () => {
  const [conversations, setConversations] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const setSelectedConversation = useSetRecoilState(selectedConversationAtom);

  const fetchConversations = async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) throw new Error("Token not found");

      const response = await fetch(
        "http://192.168.1.6:5000/api/messages/conversations",
        {
          method: "GET",
          headers: {
            "X-platform": "mobile",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch conversations");

      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleConversationPress = async (otherUserId, profilePic, username) => {
    console.log(
      "Selected Conversation Data:",
      otherUserId,
      profilePic,
      username
    );

    await SecureStore.setItemAsync(
      "selectedConversation",
      JSON.stringify({
        _id: otherUserId,
        userId: otherUserId,
        userProfilePic: profilePic,
        username: username,
      })
    );

    router.push(`/messages`);
  };

  const filteredConversations = conversations.filter(({ participants }) =>
    participants[0].username.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatMessageDate = (dateString) => {
    const date = new Date(dateString);

    if (isToday(date)) {
      return format(date, "hh:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM dd, yyyy");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#000000" />;
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-2">Your Conversations</Text>
      <View className="mb-4 flex-row items-center">
        <TextInput
          placeholder="Search for a user"
          value={searchText}
          onChangeText={setSearchText}
          className="flex-1 h-12 border border-gray-300 rounded-lg px-3"
        />
        <TouchableOpacity className="ml-3">
          <Feather name="search" size={21} color="black" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredConversations}
        renderItem={({ item }) => {
          const { lastMessage, participants } = item;
          const user = participants[0];
          const profilePic = user.profilePic;

          return (
            <TouchableOpacity
              onPress={() =>
                handleConversationPress(
                  user._id,
                  user.profilePic,
                  user.username
                )
              }
              className="flex-row items-center p-4 mb-4 bg-gray-100 rounded-lg"
            >
              {profilePic ? (
                <Image
                  source={{ uri: profilePic }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    marginRight: 12,
                  }}
                />
              ) : (
                <InitialsAvatar
                  name={user.username}
                  size={40}
                  style={{ marginRight: 12 }}
                />
              )}
              <View className="flex-1 ml-2">
                <Text className="text-lg font-bold">{user.username}</Text>
                <Text className="text-sm text-gray-500">
                  {lastMessage.text === ""
                    ? "Image"
                    : lastMessage.text.length > 34
                    ? `${lastMessage.text.slice(0, 34)}...`
                    : lastMessage.text}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="checkmark-done-outline"
                  size={20}
                  color={lastMessage.seen ? "#3b82f6" : "gray"}
                />
                <Text className="ml-2 text-gray-500 text-xs">
                  {formatMessageDate(item.updatedAt)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text>No conversations found</Text>}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    </View>
  );
};

export default MessageScreen;
