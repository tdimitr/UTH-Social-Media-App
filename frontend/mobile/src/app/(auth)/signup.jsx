import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useSetRecoilState } from "recoil";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import userAtom from "../atoms/userAtom";
import { Ionicons } from "@expo/vector-icons";
import isEmail from "validator/lib/isEmail";

export default function SignUp() {
  const [inputs, setInputs] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const setUser = useSetRecoilState(userAtom);

  const validatePassword = (password) => /^(?=.*[A-Za-z]).{6,}$/.test(password); // At least 6 characters, one letter

  const isFormIncomplete =
    !inputs.name ||
    !inputs.username ||
    !inputs.email ||
    !inputs.password ||
    !inputs.confirmPassword;

  const handleSignup = async () => {
    setErrorMessage(""); // Clear any previous errors

    if (!isEmail(inputs.email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (inputs.password !== inputs.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (!validatePassword(inputs.password)) {
      setErrorMessage(
        "Password must be at least 6 characters and contain at least one letter."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.6:5000/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Platform": "mobile",
        },
        body: JSON.stringify({
          name: inputs.name,
          email: inputs.email,
          username: inputs.username,
          password: inputs.password,
        }),
      });

      const data = await response.json();
      if (data.token) {
        const userInfo = {
          _id: data._id,
          name: data.name,
          username: data.username,
          email: data.email,
          bio: data.bio || "",
          profilePic: data.profilePic || "",
        };

        await SecureStore.setItemAsync("userToken", data.token);
        await SecureStore.setItemAsync("userInfo", JSON.stringify(userInfo));

        console.log("Account created");

        setUser(userInfo);
        router.push("/(auth)/verify");
      } else {
        console.log("Signup failed");
      }
    } catch (error) {
      setErrorMessage("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-50 px-6">
      <View className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
        <Text className="text-3xl font-bold mb-6 text-center">Sign Up</Text>

        {errorMessage ? (
          <Text className="text-red-500 text-center mb-4">{errorMessage}</Text>
        ) : null}

        <View className="flex-row space-x-4 mb-4">
          {/* Fullname */}
          <TextInput
            placeholder="Full Name"
            value={inputs.name}
            onChangeText={(text) => setInputs({ ...inputs, name: text })}
            className="border border-gray-300 rounded-lg px-4 py-3 flex-1 mb-4"
          />
          {/* Username */}
          <TextInput
            placeholder="Username"
            value={inputs.username}
            onChangeText={(text) => setInputs({ ...inputs, username: text })}
            className="border border-gray-300 rounded-lg px-4 py-3 flex-1 mb-4"
          />
        </View>
        {/* Email */}
        <TextInput
          placeholder="Email Address"
          keyboardType="email-address"
          value={inputs.email}
          onChangeText={(text) => setInputs({ ...inputs, email: text })}
          className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
        />
        {/* Password */}
        <View className="relative mb-4">
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={inputs.password}
            onChangeText={(text) => setInputs({ ...inputs, password: text })}
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 pr-10"
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
        {/*Confirm Password */}
        <View className="relative mb-4">
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry={!showConfirmPassword}
            value={inputs.confirmPassword}
            onChangeText={(text) =>
              setInputs({ ...inputs, confirmPassword: text })
            }
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 pr-10"
          />
          <TouchableOpacity
            className="absolute right-3 top-5"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={24}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className={`py-3 rounded-lg flex items-center ${
            isFormIncomplete ? "bg-gray-400 opacity-50" : "bg-blue-500"
          }`}
          onPress={handleSignup}
          disabled={isFormIncomplete || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold">Sign Up</Text>
          )}
        </TouchableOpacity>

        <Text className="text-gray-600 mt-6 text-center">
          Already a user?{" "}
          <Link replace href="/(auth)">
            <Text className="text-blue-500">Login</Text>
          </Link>
        </Text>
      </View>
    </View>
  );
}
