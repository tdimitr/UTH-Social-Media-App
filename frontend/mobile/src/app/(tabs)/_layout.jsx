import React, { useState } from "react";
import {
  Modal,
  Alert,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { Tabs } from "expo-router";
import { RecoilRoot } from "recoil";

export default function TabsLayout() {
  return (
    <RecoilRoot>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "black",
          tabBarShowLabel: false,
          headerRight: () => <HeaderButtons />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerTitle: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={23}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="followScreen"
          options={{
            headerTitle: "Suggested Users",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "people" : "people-outline"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="createPost"
          options={{
            headerTitle: "Create Post",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "add" : "add"}
                size={26}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messageScreen"
          options={{
            headerTitle: "Chat",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "chatbubble" : "chatbubble-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profileScreen"
          options={{
            headerTitle: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </RecoilRoot>
  );
}

const HeaderButtons = () => {
  const [modalVisible, setModalVisible] = useState(false);

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

  const openSettings = () => setModalVisible(true);

  const closeSettings = () => setModalVisible(false);

  const handleFreezeAccount = () => {
    closeSettings();
    router.push("/Freeze");
  };

  return (
    <>
      <View style={styles.headerContainer}>
        {/* Settings Button */}
        <TouchableOpacity onPress={openSettings} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={21} color="black" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
          <Ionicons name="log-out-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Modal for Freeze Account */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeSettings}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            <TouchableOpacity
              onPress={handleFreezeAccount}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Freeze Account</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={closeSettings}
              style={styles.modalButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
  },
  iconButton: {
    marginHorizontal: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#F1F5F9", // Equivalent to Tailwind's bg-slate-100
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    color: "black", // Black text color for "Freeze Account"
  },
  cancelButtonText: {
    fontSize: 16,
    color: "red", // Red for the cancel button
  },
});
