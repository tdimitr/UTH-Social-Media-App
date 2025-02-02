import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  //   const [loading, setLoading] = useState(false);

  //   const handleSubmit = async () => {
  //     setLoading(true);
  //     try {
  //       // Simulate API call (replace with actual fetch call)
  //       await new Promise((resolve) => setTimeout(resolve, 1000));

  //       // Navigate to the verification page after success
  //       console.log("Navigate to verifyResetCode");
  //       // Add your navigation logic here if needed
  //     } catch (error) {
  //       console.log("Error handling logic here");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-6">
      <View className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Text className="text-3xl font-bold mb-6 text-center">
          Forgot Password
        </Text>

        {/* Email Input */}
        <View className="mb-6">
          <Text className="mb-2 text-gray-700">Email Address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
        </View>

        {/* Send Reset Code Button */}
        <TouchableOpacity
          className={`bg-blue-500 py-3 rounded-lg items-center ${
            !email ? "opacity-50" : ""
          }`}
          //onPress={handleSubmit}
          disabled={!email}
        >
          <Text className="text-white font-bold">Send Reset Code</Text>
        </TouchableOpacity>

        {/* Navigate to Login */}
        <View className="mt-6">
          <Text className="text-center text-gray-600">
            Remembered your password?{" "}
            <Link replace href="/(auth)">
              <Text className="text-blue-500">Log In</Text>
            </Link>
          </Text>
        </View>
      </View>
    </View>
  );
}
