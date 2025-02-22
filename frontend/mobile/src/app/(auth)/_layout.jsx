import { Stack } from "expo-router";
import { Alert, TouchableOpacity } from "react-native";
import { RecoilRoot } from "recoil";
import { Ionicons } from "@expo/vector-icons";

export default function AuthLayout() {
  return (
    <RecoilRoot>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            title: "Login",
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            headerShown: true,
            title: "Sign up",
          }}
        />
        <Stack.Screen
          name="forgot"
          options={{
            headerShown: true,
            title: "Forgot Password",
          }}
        />
        <Stack.Screen
          name="verify"
          options={{
            headerShown: true,
            title: "Verify Account",
            headerRight: () => <LogoutButton />,
          }}
        />
      </Stack>
    </RecoilRoot>
  );
}

const LogoutButton = () => {
  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("userToken");
      await SecureStore.deleteItemAsync("userInfo");
      router.replace("/(auth)");
      console.log("Logout");
    } catch (error) {
      Alert.alert("Logout Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <TouchableOpacity onPress={handleLogout} className="mr-4">
      <Ionicons name="log-out-outline" size={24} color="black" />
    </TouchableOpacity>
  );
};
