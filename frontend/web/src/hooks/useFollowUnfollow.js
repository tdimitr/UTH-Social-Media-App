import { useState } from 'react';
import useShowToast from './useShowToast';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';

const useFollowUnfollow = (user) => {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(
    user?.followers?.includes(currentUser?._id) || false, // Added check for user.followers
  );
  const [updating, setUpdating] = useState(false);
  const showToast = useShowToast();

  const handleFollowUnfollow = async () => {
    if (!currentUser) {
      showToast(
        'Error',
        'You need to be logged in to follow or unfollow users.',
        'error',
      );
      return;
    }
    if (updating) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/users/follow/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }

      if (following) {
        showToast('Success', `Unfollowed ${user.username}`, 'success');
        // Make sure followers is defined before modifying it
        if (user.followers) {
          const index = user.followers.indexOf(currentUser?.id);
          if (index > -1) {
            user.followers.splice(index, 1);
          }
        }
      } else {
        showToast('Success', `Followed ${user.username}`, 'success');
        if (!user.followers) user.followers = []; // Initialize followers if undefined
        user.followers.push(currentUser?.id);
      }
      setFollowing(!following);
      console.log(data);
    } catch (error) {
      showToast('Error', error, 'error');
    } finally {
      setUpdating(false);
    }
  };

  return { handleFollowUnfollow, updating, following };
};

export default useFollowUnfollow;
