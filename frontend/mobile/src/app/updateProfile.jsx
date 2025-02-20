import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { uploadImageToCloudinary } from "../context/uploadImgToCloudinary";

export default function UpdateProfile() {
  const router = useRouter();

  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    bio: "",
  });
  const [password, setPassword] = useState("");
  const [imgUrl, setImgUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUserInfo = async () => {
      const userInfo = await SecureStore.getItemAsync("userInfo");
      if (userInfo) {
        const parsedUserInfo = JSON.parse(userInfo);
        setInputs({
          name: parsedUserInfo.name || "",
          username: parsedUserInfo.username || "",
          email: parsedUserInfo.email || "",
          bio: parsedUserInfo.bio || "",
        });
        setImgUrl(parsedUserInfo.profilePic || null);
      }
    };
    loadUserInfo();
  }, []);

  const handleChange = (field, value) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImgUrl(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) throw new Error("User token not found!");

      let profilePicUrl = imgUrl;
      if (imgUrl && !imgUrl.startsWith("http")) {
        const uploadResult = await uploadImageToCloudinary(imgUrl);
        profilePicUrl = uploadResult.secure_url;
      }

      const response = await fetch(
        `http://192.168.1.6:5000/api/users/mobile/update/${inputs.username}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
          body: JSON.stringify({
            ...inputs,
            profilePic: profilePicUrl,
          }),
        }
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to update profile");

      Alert.alert("Success", "Profile updated successfully!");
      await SecureStore.setItemAsync("userInfo", JSON.stringify(result));
    } catch (error) {
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      {/* Profile Image */}
      <TouchableOpacity onPress={pickMedia} className="items-center mb-6">
        <View className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
          {imgUrl ? (
            <Image source={{ uri: imgUrl }} className="w-full h-full" />
          ) : (
            <Text className="text-gray-500 text-center mt-12">Add Photo</Text>
          )}
        </View>
        <Text className="text-blue-500 mt-2">Change Profile Picture</Text>
      </TouchableOpacity>

      {/* Name */}
      <TextInput
        className="border-b border-gray-300 mb-4 p-2"
        placeholder="Full Name"
        value={inputs.name}
        onChangeText={(value) => handleChange("name", value)}
      />

      {/* Username */}
      <TextInput
        className="border-b border-gray-300 mb-4 p-2"
        placeholder="Username"
        value={inputs.username}
        onChangeText={(value) => handleChange("username", value)}
      />

      {/* Email */}
      <TextInput
        className="border-b border-gray-300 mb-4 p-2"
        placeholder="Email"
        keyboardType="email-address"
        value={inputs.email}
        onChangeText={(value) => handleChange("email", value)}
      />

      {/* Bio */}
      <TextInput
        className="border-b border-gray-300 mb-4 p-2"
        placeholder="Bio"
        value={inputs.bio}
        onChangeText={(value) => handleChange("bio", value)}
      />

      {/* Password */}
      <TextInput
        className="border-b border-gray-300 mb-6 p-2"
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={(value) => setPassword(value)}
      />

      {/* Buttons */}
      <View className="flex-row justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-red-500 py-3 px-6 rounded"
        >
          <Text className="text-white font-bold">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`py-3 px-6 rounded ${
            loading ? "bg-gray-400" : "bg-blue-500"
          }`}
        >
          <Text className="text-white font-bold">
            {loading ? "Updating..." : "Submit"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
