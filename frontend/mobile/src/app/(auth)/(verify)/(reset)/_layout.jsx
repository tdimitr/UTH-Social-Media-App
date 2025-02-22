import { Stack } from "expo-router";

export default function ResetLayout() {
  return (
    <Stack screenOptions={{ animation: "slide_from_right" }}>
      <Stack.Screen
        name="[code]"
        options={{
          title: "Reset Password",
        }}
      />
    </Stack>
  );
}
