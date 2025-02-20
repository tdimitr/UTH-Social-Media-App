import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="[name]"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
