import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import * as SecureStore from "expo-secure-store";
import SuggestedUser from "../../components/SuggestedUser";

export default function FollowScreen() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestedUsers = async () => {
    const token = await SecureStore.getItemAsync("userToken");
    try {
      const res = await fetch("http://192.168.1.6:5000/api/users/suggested", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Platform": "mobile",
        },
      });
      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Failed to fetch suggested users");
      } else {
        setSuggestedUsers(data);
      }
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSuggestedUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSuggestedUsers();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      {suggestedUsers.length === 0 ? (
        <Text>No suggested users found</Text>
      ) : (
        <FlatList
          data={suggestedUsers}
          renderItem={({ item, index }) => (
            <SuggestedUser
              user={item}
              isLastItem={index === suggestedUsers.length - 1}
            />
          )}
          keyExtractor={(item) => item._id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}
