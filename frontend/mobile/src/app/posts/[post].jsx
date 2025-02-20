import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatDistanceToNow } from "date-fns";
import InitialsAvatar from "../../context/InitialAvatars";
import Actions from "../../components/Actions";
import Comments from "../../components/Comments";

export default function Post() {
  const { post } = useLocalSearchParams();
  const router = useRouter();
  const [postData, setPostData] = useState(null);
  const [posterData, setPosterData] = useState(null);
  const [repliesCount, setRepliesCount] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`http://192.168.1.6:5000/api/posts/${post}`);
        const data = await res.json();
        if (data.error) {
          console.error(data.error);
          return;
        }
        setPostData(data);
        setRepliesCount(data.replies?.length || 0);
      } catch (error) {
        console.error(error.message);
      }
    };

    if (post) {
      fetchPost();
    }
  }, [post]);

  useEffect(() => {
    const fetchPoster = async () => {
      if (postData && postData.postedBy) {
        try {
          const res = await fetch(
            `http://192.168.1.6:5000/api/users/profile/${postData.postedBy}`
          );
          const userData = await res.json();
          if (userData.error) {
            console.error(userData.error);
            return;
          }
          setPosterData(userData);
        } catch (error) {
          console.error(error.message);
        }
      }
    };

    fetchPoster();
  }, [postData]);

  if (!postData || !posterData) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(postData.createdAt)) + " ago";

  return (
    <View className="bg-white flex-1 py-5 px-4">
      {/* Avatar and Username */}
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push(`/profile/${posterData.username}`)}
          >
            {posterData.profilePic ? (
              <Image
                source={{ uri: posterData.profilePic }}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <InitialsAvatar name={posterData.username} size={48} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push(`/profile/${posterData.username}`)}
          >
            <Text className="font-bold text-sm">{posterData.username}</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-gray-400">{timeAgo}</Text>
      </View>

      {/* Post Text */}
      <View className="mt-2">
        <Text className="text-sm text-gray-700">{postData.text}</Text>
      </View>

      {/* Post Image */}
      {postData.img && (
        <View className="mt-2 rounded-lg overflow-hidden border border-gray-200">
          <Image
            source={{ uri: postData.img }}
            className="w-full aspect-[4/3]"
          />
        </View>
      )}

      {/* Actions Section */}
      <View className="mt-2">
        <Actions
          postId={postData._id}
          likesCount={postData.likes.length}
          repliesCount={repliesCount}
          likesArray={postData.likes}
        />
      </View>

      {/* Gray Line */}
      <View className="border-t border-gray-200 my-2" />

      {/* Replies Section */}
      <View className="flex-row items-center gap-2 py-2 pl-3">
        <FontAwesome name="commenting-o" size={24} color="black" />
        <Text className="text-sm font-semibold">Replies</Text>
      </View>

      {/* Gray Line */}
      <View className="border-t border-gray-200 my-2" />

      {/* Comments Section */}
      <View className="mt-2">
        <Comments
          replies={postData.replies}
          postId={postData._id}
          setRepliesCount={setRepliesCount}
        />
      </View>
    </View>
  );
}
