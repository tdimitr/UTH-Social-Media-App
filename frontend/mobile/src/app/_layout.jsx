import { Stack } from "expo-router";
import "../../global.css";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "../context/socketContext";

export default function Layout() {
  return (
    <RecoilRoot>
      <SocketContextProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="messages" options={{ headerShown: false }} />

          <Stack.Screen name="Freeze" options={{ headerTitle: "Freeze" }} />

          <Stack.Screen
            name="updateProfile"
            options={{
              title: "Update Profile",
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen
            name="profile"
            options={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          />
          <Stack.Screen name="posts" options={{ title: "Post" }} />
        </Stack>
      </SocketContextProvider>
    </RecoilRoot>
  );
}
