import { Link } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native"; // very important
import { Ionicons } from "@expo/vector-icons";
import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";

export default function Login() {
  const user = useSetRecoilState(userAtom);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFormIncomplete = !username || !password;

  // Handle login logic
  const handleLogin = async () => {
    setLoading(true);

    try {
      // Login request
      const loginResponse = await fetch(
        "http://192.168.1.6:5000/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Platform": "mobile",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        console.log("Login successfull");

        // Prepare user info object
        const userInfo = {
          _id: loginData?._id,
          name: loginData?.name,
          username: loginData?.username,
          email: loginData?.email,
          bio: loginData?.bio || "",
          profilePic: loginData?.profilePic || "",
        };

        if (loginData.token) {
          user(userInfo);
          await SecureStore.setItemAsync("userToken", loginData.token);
          await SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));
        }

        // Check verification status
        const verifyResponse = await fetch(
          "http://192.168.1.6:5000/api/users/isVerified",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${loginData.token}`,
              "X-Platform": "mobile",
            },
          }
        );

        const verifyData = await verifyResponse.json();

        if (verifyResponse.ok) {
          // Navigate to main tabs if verified
          router.replace("/(tabs)");
        } else {
          // Navigate to verification page if not verified
          router.replace("/(auth)/verify");
        }
      } else {
        // Show login error
        Alert.alert(
          "Login Failed",
          loginData.error || "Invalid username or password"
        );
      }
    } catch (error) {
      console.log("Login error:", error.message);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-6">
      <View className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Text className="text-3xl font-bold mb-6 text-center">Log In</Text>

        {/* Username Input */}
        <TextInput
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />

        {/* Password Input with eye toggle */}
        <View className="relative mb-6">
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            className="border border-gray-300 rounded-lg px-4 py-3 pr-10"
          />
          <TouchableOpacity
            className="absolute right-3 top-5"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          className={`bg-blue-500 py-3 rounded-lg items-center ${
            loading || isFormIncomplete
              ? "bg-gray-400 opacity-50"
              : "bg-blue-500"
          }`}
          onPress={handleLogin}
          disabled={loading || isFormIncomplete}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text className="text-white font-bold">Login</Text>
          )}
        </TouchableOpacity>

        {/* Signup Link */}
        <View className="mt-6">
          <Text className="text-center text-gray-600">
            Don't have an account?{" "}
            <Link replace href="/(auth)/signup">
              <Text className="text-blue-500">Sign up</Text>
            </Link>
          </Text>

          {/* Forgot Password Link */}
          <Text className="text-center text-gray-600 mt-2">
            <Link replace href="/(auth)/forgot">
              <Text className="text-blue-500">Forgot Password?</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
