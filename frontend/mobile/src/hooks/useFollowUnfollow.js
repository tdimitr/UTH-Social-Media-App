import { useState } from "react";
import { useRecoilValue } from "recoil";
import * as SecureStore from "expo-secure-store";
import userAtom from "../app/atoms/userAtom";
import Toast from "react-native-toast-message";

const useFollowUnfollow = (user) => {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(
    user?.followers?.includes(currentUser?._id) || false
  );
  const [updating, setUpdating] = useState(false);

  const handleFollowUnfollow = async () => {
    if (!currentUser) {
      console.log("You need to be logged in to follow or unfollow users.");

      return;
    }
    if (updating) return;

    setUpdating(true);

    try {
      const token = await SecureStore.getItemAsync("userToken");
      if (!token) {
        console.log("Authentication token not found.");
        setUpdating(false);
        return;
      }

      const res = await fetch(
        `http://192.168.1.6:5000/api/users/follow/${user._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Platform": "mobile",
          },
        }
      );

      const data = await res.json();

      if (data.error) {
        console.log(data.error);
        return;
      }

      if (following) {
        console.log(`Unfollowed ${user.username}`);
        if (user.followers) {
          const index = user.followers.indexOf(currentUser?._id);
          if (index > -1) {
            user.followers.splice(index, 1);
          }
        }
        console.log("Unfollow");
      } else {
        console.log(`Followed ${user.username}`);
        if (!user.followers) user.followers = [];
        user.followers.push(currentUser?._id);
        console.log("Follow");
      }

      setFollowing(!following);
    } catch (error) {
      console.log("Failed to update follow status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  return { handleFollowUnfollow, updating, following };
};

export default useFollowUnfollow;
