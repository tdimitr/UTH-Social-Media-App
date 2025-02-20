import { Box, Flex, Spinner, VStack, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import Post from '../components/Post.jsx';
import postsAtom from '../atoms/postsAtom.js';
import { useRecoilState } from 'recoil';
import SuggestedUsers from '../components/SuggestedUsers.jsx';

import { IoMdPersonAdd } from 'react-icons/io';

export const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const getFeedPosts = async () => {
      setLoading(true);
      setPosts([]);
      try {
        const res = await fetch('/api/posts/feed');
        const data = await res.json();
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        setPosts(data);
      } catch (error) {
        showToast('Error', error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    getFeedPosts();
  }, [showToast, setPosts]);

  return (
    <Flex gap='10' alignItems={'flex-start'}>
      <Box flex={70}>
        {!loading && posts.length === 0 && (
          <VStack spacing={4} mt={10} align='center'>
            <IoMdPersonAdd size='50px' color='gray' />
            <Text fontSize='2xl' fontWeight='bold'>
              No Posts Yet
            </Text>
            <Text fontSize='md' color='gray.600' textAlign='center'>
              It looks like your feed is empty.
            </Text>
            <Text fontSize='md' color='gray.600' textAlign='center'>
              Start following users to see their posts and updates here!
            </Text>
            <Text fontSize='sm' color='gray.600' textAlign='center'>
              You can follow users by clicking the Follow button.
            </Text>
          </VStack>
        )}
        {loading && (
          <Flex justify={'center'}>
            <Spinner size={'xl'} />
          </Flex>
        )}
        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </Box>
      <Box flex={30} display={{ base: 'none', md: 'block' }}>
        <SuggestedUsers />
      </Box>
    </Flex>
  );
};
