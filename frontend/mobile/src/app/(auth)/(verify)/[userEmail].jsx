import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function VerifyResetCodePage() {
  const { userEmail } = useLocalSearchParams();
  const [resetCode, setResetCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!userEmail) {
      router.replace("/(auth)");
    }
  }, [userEmail]);

  const handleResetCodeVerification = async () => {
    if (!resetCode) return;

    setLoading(true);
    try {
      const response = await fetch(
        "http://192.168.1.6:5000/api/users/verifyResetCode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, code: resetCode }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await SecureStore.setItemAsync("userEmail", userEmail);
        router.push(`/(reset)/${resetCode}`);
      } else {
        Alert.alert("Error", data.error || "Verification failed.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendResetCode = async () => {
    setResendLoading(true);
    try {
      const response = await fetch(
        "http://192.168.1.6:5000/api/users/resendResetPasswordCode",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "A new reset code has been sent to your email.");
      } else {
        Alert.alert("Error", data.error || "Failed to resend reset code.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-6">
      <View className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Text className="text-2xl font-bold text-center">
          Verify Reset Code
        </Text>
        <Text className="text-center text-gray-700 mt-4">
          Enter the 6-digit code sent to your Email
        </Text>

        <TextInput
          value={resetCode}
          onChangeText={setResetCode}
          placeholder="Enter reset code"
          keyboardType="numeric"
          maxLength={6}
          className="border border-gray-300 rounded-lg px-4 py-2 text-center mt-4"
        />

        <TouchableOpacity
          className={`bg-blue-500 py-3 rounded-lg items-center mt-4 ${
            !resetCode || loading ? "opacity-50" : ""
          }`}
          onPress={handleResetCodeVerification}
          disabled={!resetCode || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Verify Reset Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-4"
          onPress={handleResendResetCode}
          disabled={resendLoading}
        >
          <Text className="text-blue-500 text-center">
            {resendLoading ? "Resending..." : "Resend Reset Code"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
