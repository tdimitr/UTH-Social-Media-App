import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!email) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://192.168.1.6:5000/api/users/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        router.push(`/(verify)/${email}`);
      } else {
        Alert.alert("Error", data.message || "Something went wrong.");
      }
    } catch (error) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-6">
      <View className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Text className="text-3xl font-bold mb-6 text-center">
          Forgot Password
        </Text>

        {/* Email Input */}
        <View className="mb-6">
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
            !email || loading ? "opacity-50" : ""
          }`}
          onPress={handleSubmit}
          disabled={!email || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Send Reset Code</Text>
          )}
        </TouchableOpacity>

        {/* Navigate to Login */}
        <View className="mt-6">
          <Text className="text-center text-gray-600">
            Remembered your password?{" "}
            <Text
              className="text-blue-500"
              onPress={() => router.replace("/(auth)")}
            >
              Log In
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
