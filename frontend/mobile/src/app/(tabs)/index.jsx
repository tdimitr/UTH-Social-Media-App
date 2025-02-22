import React, { useEffect, useState } from "react";
import { FlatList, View, Text, ActivityIndicator } from "react-native";
import Post from "../../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtoms";
import * as SecureStore from "expo-secure-store";

export default function HomeScreen() {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getFeedPosts = async () => {
    const token = await SecureStore.getItemAsync("userToken");
    try {
      const res = await fetch(`http://192.168.1.6:5000/api/posts/feed`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Platform": "mobile",
        },
      });

      const data = await res.json();
      if (res.ok) {
        setPosts(data);
      } else {
        console.error("getFeedPosts error:", data.error);
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getFeedPosts();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    getFeedPosts();
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-lg font-bold">No Posts Yet</Text>
        <Text className="text-center text-gray-500 mt-2">
          Start following users to see their posts and updates here!
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={posts}
        renderItem={({ item }) => <Post post={item} postedBy={item.postedBy} />}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: posts.length < 4 ? 40 : 0 }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      {posts.length < 4 && <View className="flex-1 bg-gray-100"></View>}
    </View>
  );
}
