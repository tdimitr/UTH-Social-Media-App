import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { uploadImageToCloudinary } from "../context/uploadImgToCloudinary";
import { useSetRecoilState } from "recoil";
import conversationsAtom from "../app/atoms/conversationAtom";

const MessageInput = ({ recipientId, onMessageSent }) => {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(""); // Stores the local image URI
  const [imageUrl, setImageUrl] = useState(""); // Stores the uploaded image URL
  const [token, setToken] = useState(null);
  const setConversations = useSetRecoilState(conversationsAtom);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync("userToken");
        if (storedToken) {
          setToken(storedToken);
        } else {
          console.error("Token not found in SecureStore");
        }
      } catch (error) {
        console.error("Error retrieving token:", error);
      }
    };

    fetchToken();
  }, []);

  // Handle selecting an image from the gallery
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri); // Store the local URI for preview
      setImageUrl(""); // Reset the uploaded URL
    }
  };

  // Upload image to Cloudinary and store URL
  const handleImageUpload = async () => {
    if (!image) return null;
    try {
      const uploadResponse = await uploadImageToCloudinary(image);
      console.log("Cloudinary Upload Response:", uploadResponse);

      if (uploadResponse && uploadResponse.secure_url) {
        const uploadedUrl = uploadResponse.secure_url;
        setImageUrl(uploadedUrl); // Save only the URL
        Alert.alert("Success", "Image uploaded successfully!");
        return uploadedUrl;
      } else {
        throw new Error("Invalid Cloudinary response");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload image.");
      console.error("Cloudinary Upload Error:", error);
      return null;
    }
  };

  // Handle sending a message with optional image
  const handleSendMessage = async () => {
    if (!message.trim() && !image) return; // Ensure either message or image exists

    try {
      let uploadedImageUrl = imageUrl;

      // Upload image only if it's selected but not uploaded yet
      if (image && !imageUrl) {
        uploadedImageUrl = await handleImageUpload();
        if (!uploadedImageUrl) return; // Ensure image upload succeeds
      }

      const response = await fetch(
        "http://192.168.1.6:5000/api/messages/mobile",
        {
          method: "POST",
          headers: {
            "x-platform": "mobile",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientId,
            message: message.trim(),
            img: uploadedImageUrl || "",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const data = await response.json();
      onMessageSent(data);

      // Reset input fields
      setMessage("");
      setImage("");
      setImageUrl("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Selection Icon */}
      <TouchableOpacity onPress={pickMedia} style={styles.imageIcon}>
        <Ionicons name="image-outline" size={24} color="black" />
      </TouchableOpacity>

      {/* Image Preview (if selected) */}
      {image ? (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image }} style={styles.imagePreview} />
          <TouchableOpacity
            onPress={() => setImage("")}
            style={styles.removeImage}
          >
            <Ionicons name="close-circle" size={20} color="red" />
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Message Input Field */}
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Type a message..."
        style={styles.input}
      />

      {/* Send Icon */}
      <TouchableOpacity onPress={handleSendMessage} style={styles.sendIcon}>
        <MaterialCommunityIcons name="send" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ffffff",
  },
  imageIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendIcon: {
    marginLeft: 10,
  },
  imagePreviewContainer: {
    position: "relative",
    marginRight: 10,
  },
  imagePreview: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  removeImage: {
    position: "absolute",
    top: -5,
    right: -5,
  },
});

export default MessageInput;
