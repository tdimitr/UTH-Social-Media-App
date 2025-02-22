import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import InitialAvatar from "../context/InitialAvatars";
import MessageInput from "../components/messageInput";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

const Messages = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchConversationAndUserInfo = async () => {
      const storedConversation = await SecureStore.getItemAsync(
        "selectedConversation"
      );
      const storedUserInfo = await SecureStore.getItemAsync("userInfo");

      if (storedConversation)
        setSelectedConversation(JSON.parse(storedConversation));
      if (storedUserInfo) setUserInfo(JSON.parse(storedUserInfo));
    };

    fetchConversationAndUserInfo();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const token = await SecureStore.getItemAsync("userToken");
          if (!token) throw new Error("Token not found");

          const response = await fetch(
            `http://192.168.1.6:5000/api/messages/${selectedConversation.userId}`,
            {
              method: "GET",
              headers: {
                "X-platform": "mobile",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch messages");

          const data = await response.json();
          setMessages(data);
        } catch (error) {
          console.error("Error fetching messages:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderMessage = ({ item }) => {
    const isOwnMessage = item.sender === userInfo?._id;

    return (
      <View
        style={{
          flexDirection: isOwnMessage ? "row-reverse" : "row",
          alignItems: "center",
          marginBottom: 15,
          gap: 6,
        }}
      >
        {/* Profile Picture */}
        {isOwnMessage && userInfo?.profilePic ? (
          <Image
            source={{ uri: userInfo.profilePic }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
            }}
          />
        ) : (
          item.sender !== userInfo?._id &&
          (selectedConversation?.userProfilePic ? (
            <Image
              source={{ uri: selectedConversation.userProfilePic }}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
              }}
            />
          ) : (
            <InitialAvatar
              name={selectedConversation.username}
              size={36}
              style={{}}
            />
          ))
        )}

        {/* Message Bubble or Photo */}
        {item.img ? (
          <TouchableOpacity onPress={() => openImage(item.img)}>
            <Image
              source={{ uri: item.img }}
              style={{ width: 200, height: 200, borderRadius: 8 }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ) : (
          <View
            style={{
              maxWidth: "70%",
              padding: 10,
              borderRadius: 10,
              backgroundColor: isOwnMessage ? "#3b82f6" : "#e5e7eb",
              alignItems: isOwnMessage ? "flex-end" : "flex-start",
              position: "relative",
            }}
          >
            <Text style={{ color: isOwnMessage ? "#ffffff" : "#000000" }}>
              {item.text}
            </Text>

            {/* Seen Icon */}
            {isOwnMessage && (
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color={item.seen ? "#3b82f6" : "gray"}
                style={{
                  position: "absolute",
                  bottom: -16,
                  right: -2,
                }}
              />
            )}
          </View>
        )}
      </View>
    );
  };

  const openImage = (imageUri) => {
    setSelectedImage(imageUri);
    setIsImageModalVisible(true);
  };

  const closeImageModal = () => {
    setIsImageModalVisible(false);
    setSelectedImage(null);
  };

  if (loading || !selectedConversation) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 16,
          backgroundColor: "#ffffff",
          borderBottomWidth: 1,
          borderBottomColor: "#e5e7eb",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={26} color="#374151" />
        </TouchableOpacity>

        {/* Clickable Profile Picture */}
        <TouchableOpacity
          onPress={() =>
            router.push(`/profile/${selectedConversation.username}`)
          }
        >
          {selectedConversation.userProfilePic ? (
            <Image
              source={{ uri: selectedConversation.userProfilePic }}
              style={{
                width: 45,
                height: 45,
                borderRadius: 25,
                marginHorizontal: 12,
              }}
            />
          ) : (
            <InitialAvatar
              name={selectedConversation.username}
              size={50}
              style={{ marginHorizontal: 12 }}
            />
          )}
        </TouchableOpacity>

        {/* Clickable Username */}
        <TouchableOpacity
          onPress={() =>
            router.push(`/profile/${selectedConversation.username}`)
          }
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#374151",
            }}
          >
            {selectedConversation.username}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Message Input */}
      <View style={{ padding: 16 }}>
        <MessageInput
          recipientId={selectedConversation.userId}
          onMessageSent={(newMessage) =>
            setMessages((prev) => [...prev, newMessage])
          }
        />
      </View>

      {/* Full-screen Image Modal */}
      <Modal
        visible={isImageModalVisible}
        onRequestClose={closeImageModal}
        transparent={true}
        animationType="fade"
      >
        <TouchableWithoutFeedback onPress={closeImageModal}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            }}
          >
            <Image
              source={{ uri: selectedImage }}
              style={{ width: width, height: height, resizeMode: "contain" }}
            />
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

export default Messages;
