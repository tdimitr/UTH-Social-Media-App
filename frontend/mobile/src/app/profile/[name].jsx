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

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.6:5000/api/users/profile/${name}`
      );
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchPostsData = async () => {
    try {
      const response = await fetch(
        `http://192.168.1.6:5000/api/posts/user/${name}`
      );
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchUserData();
      await fetchPostsData();
      setLoading(false);
    };
    fetchData();
  }, [name]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchPostsData();
    setRefreshing(false);
  }, []);

  return (
    <View className="flex-1 bg-white">
      {/* Header with Back Arrow, Always Visible */}
      <View className="flex-row items-center p-5 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <AntDesign name="arrowleft" size={26} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold">{name}</Text>
      </View>

      {/* Loading Indicator */}
      {loading && !refreshing && (
        <View className="flex-1 justify-center items-center bg-white">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="mt-4">Loading...</Text>
        </View>
      )}

      {/* Content */}
      {!loading && (
        <>
          <UserHeader
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {activeTab === "posts" ? (
            posts.length === 0 ? (
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
                  <OtherPostListItem
                    user={user}
                    post={item}
                    setPosts={setPosts}
                  />
                )}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
              />
            )
          ) : (
            activeTab === "replies" && (
              <OtherRepliesListItem user={user} activeTab={activeTab} />
            )
          )}
        </>
      )}
    </View>
  );
}
