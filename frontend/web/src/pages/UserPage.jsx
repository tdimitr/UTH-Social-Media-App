import { useEffect, useState } from 'react';
import UserHeader from '../components/UserHeader.jsx';
import { useParams } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast.js';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import Post from '../components/Post.jsx';
import useGetUserProfile from '../hooks/useGetUserProfile.js';
import { useRecoilState } from 'recoil';
import postsAtom from '../atoms/postsAtom.js';
import { MdErrorOutline } from 'react-icons/md';
import { MdOutlineNoteAdd } from 'react-icons/md';
import RepliesList from '../components/RepliesList.jsx';

export const UserPage = () => {
  const { user, loading } = useGetUserProfile();
  const { username } = useParams();
  const showToast = useShowToast();

  const [posts, setPosts] = useRecoilState(postsAtom);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (activeTab !== 'posts' || !user) return;
    const getPosts = async () => {
      if (!user) return;
      setFetchingPosts(true);
      try {
        const res = await fetch(`/api/posts/user/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast('Error', 'Page Not Found', 'error');
          return;
        }
        setPosts(data);
      } catch (error) {
        showToast('Error', error.message, 'error');
        setPosts([]);
      } finally {
        setFetchingPosts(false);
      }
    };

    getPosts();
  }, [username, showToast, setPosts, user, activeTab]);

  if (!user && loading) {
    return (
      <Flex justifyContent={'center'}>
        <Spinner size={'xl'} />
      </Flex>
    );
  }

  if (!user && !loading) {
    return (
      <VStack spacing={4} mt={10} align='center'>
        <MdErrorOutline size='50px' color='gray' />
        <Text fontSize='4xl' fontWeight='bold'>
          404
        </Text>
        <Text fontSize='md' color='gray.600'>
          Hmm... we couldn&apos;t find that user.
        </Text>
        <Text fontSize='sm' color='gray.600'>
          Double-check the username?
        </Text>
      </VStack>
    );
  }

  return (
    <>
      <UserHeader
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {activeTab === 'posts' && !fetchingPosts && posts.length === 0 && (
        <VStack spacing={4} mt={10} align='center'>
          <MdOutlineNoteAdd size='50px' color='gray' />
          <Text fontSize='2xl' fontWeight='bold'>
            No Posts Yet
          </Text>
          <Text fontSize='md' color='gray.600'>
            This user has not shared any posts
          </Text>
        </VStack>
      )}

      {activeTab === 'posts' && fetchingPosts && (
        <Flex justifyContent={'center'} my={12}>
          <Spinner size={'xl'} />
        </Flex>
      )}

      {activeTab === 'posts' &&
        posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}

      {activeTab === 'replies' && <RepliesList username={username} />}
    </>
  );
};
