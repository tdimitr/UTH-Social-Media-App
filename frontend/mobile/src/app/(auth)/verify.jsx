import { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Button,
  TouchableOpacity,
  Spinner,
} from "react-native";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import verifyAtom from "../atoms/verifyAtom";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

const VerifyEmailPage = () => {
  const user = useRecoilValue(userAtom);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const setVerify = useSetRecoilState(verifyAtom);

  // Handle Verification
  const handleVerification = async () => {
    setLoading(true);
    try {
      if (!verificationCode) {
        console.log("Verification code is undefined or empty");
        return;
      }

      // Retrieve the token from SecureStore
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("No token found.");
        return;
      }

      const response = await fetch(
        "http://192.168.1.6:5000/api/users/verify-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
          body: JSON.stringify({ code: verificationCode }),
        }
      );

      const data = await response.json();

      if (data.isVerified) {
        setVerify(true);
        console.log("Email verified successfully");
        router.replace("/(tabs)");
      } else {
        console.log("Verification failed:", data.error);
      }
    } catch (error) {
      console.log("An error occurred. Please try again", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Resending the Verification Code
  const handleResendVerificationCode = async () => {
    setResending(true);
    try {
      // Retrieve the token from SecureStore
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("No token found.");
        return;
      }

      const response = await fetch(
        "http://192.168.1.5:5000/api/users/resendVerificationCode",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
        }
      );

      const data = await response.json();

      if (response.status === 200) {
        console.log("Verification code resent successfully.");
      } else {
        console.log("Failed to resend verification code:", data.error);
      }
    } catch (error) {
      console.log("An error occurred while resending the code.", error);
    } finally {
      setResending(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center p-4">
      <View className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <View className="items-center mb-6">
          <Text className="text-xl font-semibold text-center mb-2">
            Verify Your Email
          </Text>
          <Text className="text-base text-center mb-4">
            Enter the 6-digit code sent to your email to verify your account.
          </Text>
        </View>

        <TextInput
          className="w-full h-12 px-4 mb-4 border border-gray-300 rounded-lg text-center"
          placeholder="Enter verification code"
          maxLength={6}
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="numeric"
          editable={!loading}
        />

        <Button
          title={loading ? "Verifying..." : "Verify Email"}
          onPress={handleVerification}
          disabled={!verificationCode || loading}
        />

        <TouchableOpacity
          className="mt-4"
          onPress={handleResendVerificationCode}
          disabled={resending}
        >
          <Text className="text-blue-500 text-center">
            {resending ? "Resending..." : "Resend Verification Code"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyEmailPage;
