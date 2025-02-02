import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import UserHeader from "../../components/UserHeader";
import PostListItem from "../../components/PostListItem";
import RepliesListItem from "../../components/RepliesListItem";
import * as SecureStore from "expo-secure-store";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams(); // Detect refresh trigger

  const [userInfo, setUserInfo] = useState(null);
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [refreshing, setRefreshing] = useState(false);

  const getUserInfo = async () => {
    const userInfoData = await SecureStore.getItemAsync("userInfo");
    return userInfoData ? JSON.parse(userInfoData) : null;
  };

  const fetchUserData = async () => {
    setLoadingUser(true);
    const userInfoData = await getUserInfo();
    if (!userInfoData) {
      console.error("User info not found in SecureStore");
      return;
    }
    setUserInfo(userInfoData);

    const token = await SecureStore.getItemAsync("userToken");

    try {
      const res = await fetch(
        `http://192.168.1.6:5000/api/users/profile/${userInfoData.username}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setUser(data);
      } else {
        console.error("User fetch error:", data.error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchPostsData = async () => {
    setLoadingPosts(true);
    const token = await SecureStore.getItemAsync("userToken");
    const userInfoData = await getUserInfo();
    const currentUserId = userInfoData?._id;

    try {
      const res = await fetch(
        `http://192.168.1.6:5000/api/posts/user/${userInfoData?.username}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
        }
      );
      const data = await res.json();
      if (res.ok) {
        const updatedPosts = data.map((post) => ({
          ...post,
          isLiked: post.likes.includes(currentUserId),
        }));
        setPosts(updatedPosts);
      } else {
        console.error("Posts fetch error:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchPostsData();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [refresh]);

  useEffect(() => {
    if (userInfo) {
      fetchPostsData();
    }
  }, [userInfo, activeTab]);

  if (loadingUser && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center p-8">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-4">Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-4xl font-bold">404</Text>
        <Text className="text-gray-500 mt-2">User not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <UserHeader
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === "posts" ? (
        loadingPosts ? (
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
              <PostListItem user={user} post={item} setPosts={setPosts} />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )
      ) : (
        activeTab === "replies" && (
          <RepliesListItem user={user} activeTab={activeTab} />
        )
      )}
    </View>
  );
}
