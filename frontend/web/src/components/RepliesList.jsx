/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Flex, Spinner, Text, VStack } from '@chakra-ui/react';
import Comments from './Comment';
import useShowToast from '../hooks/useShowToast';
import { FiMessageCircle } from 'react-icons/fi';

const RepliesList = ({ username }) => {
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const fetchReplies = async () => {
      setLoadingReplies(true);
      try {
        const res = await fetch(`/api/posts/replies/${username}`);
        const data = await res.json();
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        setReplies(data);
      } catch (error) {
        showToast('Error', error.message, 'error');
        setReplies([]);
      } finally {
        setLoadingReplies(false);
      }
    };

    fetchReplies();
  }, [username, showToast]);

  if (loadingReplies) {
    return (
      <Flex justifyContent='center' my={12}>
        <Spinner size='xl' />
      </Flex>
    );
  }

  if (replies.length === 0) {
    return (
      <VStack spacing={4} mt={10} align='center'>
        <FiMessageCircle size='50px' color='gray' />
        <Text fontSize='2xl' fontWeight='bold'>
          No Replies Yet
        </Text>
        <Text fontSize='md' color='gray.600'>
          This user has not received any replies
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} mt={4} align='center' w='full'>
      {replies.map((reply) => (
        <Comments key={reply._id} reply={reply} lastReply={false} />
      ))}
    </VStack>
  );
};

export default RepliesList;
