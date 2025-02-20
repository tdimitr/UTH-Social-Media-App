import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import { uploadImageToCloudinary } from "../../context/uploadImgToCloudinary";

export default function CreatePost() {
  const [image, setImage] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle media selection
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Clear selected image
  const clearImage = () => {
    setImage("");
  };

  // Upload image to Cloudinary and get the URL
  const handleImageUpload = async () => {
    if (!image) return null;
    try {
      const imageUrl = await uploadImageToCloudinary(image);
      Alert.alert("Success", "Image uploaded successfully!");
      return imageUrl.secure_url;
    } catch (error) {
      Alert.alert("Error", "Failed to upload image.");
      return null;
    }
  };

  // Create post function
  const createPost = async () => {
    if (!caption.trim()) {
      console.log("Post content cannot be empty");
      return;
    }

    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const userInfo = await SecureStore.getItemAsync("userInfo");

      const user = JSON.parse(userInfo);
      const userId = user._id;

      // Upload image if selected and get the image URL
      let imageUrl = await handleImageUpload();

      const postData = {
        postedBy: userId,
        text: caption,
        img: imageUrl,
      };

      const res = await fetch(
        "http://192.168.1.6:5000/api/posts/mobile/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Platform": "mobile",
          },
          body: JSON.stringify(postData),
        }
      );

      const data = await res.json();

      if (data.error) {
        console.log("Error:", data.error);
        return;
      }

      console.log("Post created successfully");

      // Reset form after successful post creation
      setImage("");
      setCaption("");
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      {/* Image preview */}
      {!image ? (
        <View className="w-72 h-72 bg-slate-300 justify-center items-center rounded-lg">
          <Text>No image selected</Text>
        </View>
      ) : (
        <View className="relative">
          <Image source={{ uri: image }} className="w-72 h-72 rounded-lg" />
          <TouchableOpacity
            onPress={clearImage}
            className="absolute top-2 right-2 bg-red-600 w-8 h-8 justify-center items-center"
          >
            <Text className="text-white font-bold">X</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Choose Image Button */}
      <TouchableOpacity
        onPress={pickMedia}
        className="mt-5 bg-lightblue py-2 px-4 rounded-md"
      >
        <Text>Choose Image</Text>
      </TouchableOpacity>

      {/* Caption Input */}
      <TextInput
        value={caption}
        onChangeText={setCaption}
        placeholder="What's on your mind?"
        className="w-full p-3 border border-gray-300 rounded-md mt-5"
      />

      {/* Post Button */}
      <View className="mt-auto w-full">
        <TouchableOpacity
          onPress={createPost}
          className={`py-3 rounded-md justify-center items-center ${
            loading || !caption.trim()
              ? "bg-gray-400 opacity-50"
              : "bg-blue-500"
          }`}
          disabled={loading || !caption.trim()}
        >
          <Text className="text-white font-semibold">
            {loading ? "Posting..." : "Post"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
