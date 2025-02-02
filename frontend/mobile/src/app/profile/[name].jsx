import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import UserHeader from "../../components/OtherUserHeader";
import OtherPostListItem from "../../components/OtherUserPosts";
import OtherRepliesListItem from "../../components/RepliesListItem";

export default function OthersProfileScreen() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(
          `http://192.168.1.6:5000/api/users/profile/${name}`
        );
        const userData = await userResponse.json();
        setUser(userData);

        // Fetch user posts
        const postsResponse = await fetch(
          `http://192.168.1.6:5000/api/posts/user/${name}`
        );
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchPostsData();
    setRefreshing(false);
  }, []);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-4">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header with Back Arrow */}
      <View className="flex-row items-center p-5 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <AntDesign name="arrowleft" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">{name}</Text>
      </View>

      <UserHeader
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "posts" ? (
        loading ? (
          <View className="flex-1 justify-center items-center p-8">
            <ActivityIndicator size="large" color="#000000" />
            <Text className="mt-4">Loading Posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View className="flex-1 justify-center items-center p-8">
            <Text className="text-xl font-bold">No Posts Yet</Text>
            <Text className="text-gray-500 mt-2">
              This user has not shared any posts.
            </Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <OtherPostListItem user={user} post={item} setPosts={setPosts} />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )
      ) : (
        activeTab === "replies" && (
          <OtherRepliesListItem user={user} activeTab={activeTab} />
        )
      )}
    </View>
  );
}
