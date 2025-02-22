import { Stack } from "expo-router";

export default function PostLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[post]"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
