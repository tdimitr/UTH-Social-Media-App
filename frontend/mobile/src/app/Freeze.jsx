import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

const FreezeAccountPage = () => {
  const [isFreezing, setIsFreezing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const freezeAccount = async () => {
    setIsFreezing(true);

    const token = await SecureStore.getItemAsync("userToken");

    try {
      const res = await fetch("http://192.168.1.6:5000/api/users/freeze", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "X-Platform": "mobile",
        },
      });

      const data = await res.json();

      if (data.error) {
        Alert.alert("Error", data.error);
        return;
      }

      if (data.success) {
        // Clear user data and token after successful account freeze
        await SecureStore.deleteItemAsync("userToken");
        await SecureStore.deleteItemAsync("userInfo");
        Alert.alert("Success", "Your account has been frozen", [
          { text: "OK", onPress: () => router.replace("/(auth)") },
        ]);
      }
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsFreezing(false);
      setIsOpen(false);
    }
  };

  return (
    <View className="flex-1 justify-start items-center p-4 bg-white">
      <Ionicons name="snow-outline" size={48} color="#3B82F6" />
      <Text className="text-2xl font-bold mt-6 text-gray-800">
        Freeze Your Account
      </Text>
      <Text className="text-lg text-gray-600 mt-2 text-center">
        Freezing your account will temporarily deactivate it.
      </Text>
      <Text className="text-sm text-gray-500 mt-2 text-center">
        Your data and settings will be saved, and you can reactivate it anytime.
      </Text>

      {/* Freeze Account Button */}
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className="bg-blue-600 py-3 px-8 rounded-lg mt-6"
      >
        <Text className="text-white text-lg font-semibold text-center">
          Freeze Account
        </Text>
      </TouchableOpacity>

      {/* Modal for Confirmation */}
      <Modal
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
        transparent
        animationType="slide"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl p-6 w-full">
            <Text className="text-lg font-bold mb-6 text-center text-gray-800">
              Are you sure you want to freeze your account? This action is
              temporary.
            </Text>

            <View className="flex-row justify-evenly items-center">
              {/* Cancel Button */}
              <TouchableOpacity
                onPress={() => setIsOpen(false)}
                className="bg-red-600 py-3 px-8 rounded-lg"
              >
                <Text className="text-white text-lg font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={freezeAccount}
                disabled={isFreezing}
                className={`bg-blue-600 py-3 px-8 rounded-lg ${
                  isFreezing ? "opacity-50" : ""
                }`}
              >
                <Text className="text-white text-lg font-semibold text-center">
                  {isFreezing ? "Freezing..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FreezeAccountPage;
