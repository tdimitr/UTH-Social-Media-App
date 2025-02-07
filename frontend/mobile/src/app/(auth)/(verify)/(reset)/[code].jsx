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

export default function ResetPasswordPage() {
  const { code } = useLocalSearchParams();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      const storedEmail = await SecureStore.getItemAsync("userEmail");
      if (storedEmail) {
        setUserEmail(storedEmail);
      } else {
        router.replace("/(auth)");
      }
    };
    fetchEmail();
  }, []);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }
    if (!/[a-zA-Z]/.test(password)) {
      return "Password must contain at least one letter.";
    }
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return "Passwords do not match.";
    }
    return "";
  };

  const handlePasswordReset = async () => {
    const passwordValidationError = validatePassword(newPassword);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    setPasswordError("");

    const confirmPasswordValidationError = validateConfirmPassword(
      newPassword,
      confirmPassword
    );
    if (confirmPasswordValidationError) {
      setConfirmPasswordError(confirmPasswordValidationError);
      return;
    }
    setConfirmPasswordError("");

    setLoading(true);
    try {
      const response = await fetch(
        "http://192.168.1.6:5000/api/users/resetPassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: userEmail,
            code,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Password reset successfully.");
        await SecureStore.deleteItemAsync("userEmail");
        router.replace("/(auth)");
      } else {
        Alert.alert("Error", data.error || "Failed to reset password.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100 px-6">
      <View className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <Text className="text-2xl font-bold text-center">
          Reset Your Password
        </Text>
        <Text className="text-gray-700 text-center mt-4">
          Enter a new password for your account.
        </Text>

        <TextInput
          placeholder="New Password"
          secureTextEntry
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setPasswordError(validatePassword(text));
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 mt-4"
        />
        {passwordError && <Text className="text-red-500">{passwordError}</Text>}

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setConfirmPasswordError(validateConfirmPassword(newPassword, text));
          }}
          className="border border-gray-300 rounded-lg px-4 py-2 mt-4"
        />
        {confirmPasswordError && (
          <Text className="text-red-500">{confirmPasswordError}</Text>
        )}

        <TouchableOpacity
          className={`bg-blue-500 py-3 rounded-lg items-center mt-6 ${
            loading ? "opacity-50" : ""
          }`}
          onPress={handlePasswordReset}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold">Reset Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
