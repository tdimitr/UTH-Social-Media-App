import { Stack } from "expo-router";

export default function VerifyLayout() {
  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen
        name="[userEmail]"
        options={{
          title: "Verify Reset Code",
        }}
      />
      <Stack.Screen name="(reset)" options={{ headerShown: false }} />
    </Stack>
  );
}
