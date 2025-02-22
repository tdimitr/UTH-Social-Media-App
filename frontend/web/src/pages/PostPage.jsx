import { useEffect, useState } from 'react';
import {
  Image,
  Avatar,
  Text,
  Box,
  Flex,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';
import Actions from '../components/Actions';
import Comment from '../components/Comment';
import useGetUserProfile from '../hooks/useGetUserProfile';
import { Spinner, useColorModeValue } from '@chakra-ui/react';
import useShowToast from '../hooks/useShowToast';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { DeleteIcon } from '@chakra-ui/icons';
import userAtom from '../atoms/userAtom';
import { useRecoilState, useRecoilValue } from 'recoil';
import postsAtom from '../atoms/postsAtom';

export const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const showToast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();
  const dividerColor = useColorModeValue('gray.400', 'gray.600');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDeleteId, setPostToDeleteId] = useState(null);
  const [DeleteIsLoading, setDeleteIsLoading] = useState(false);

  const currentPost = posts[0];

  useEffect(() => {
    // fetch post
    const getPost = async () => {
      setPosts([]);
      try {
        // send GET request to the server to fetch post by id
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        // error
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        setPosts([data]); // update UI data
      } catch (error) {
        showToast('Error', error.message, 'error');
      }
    };
    getPost();
  }, [showToast, pid, setPosts]); // re-runs when post id change

  const handleDeletePost = async () => {
    setDeleteIsLoading(true);
    try {
      const res = await fetch(`/api/posts/delete/${postToDeleteId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast('Success', 'Post deleted successfully', 'success');
      navigate(`/${user.username}`);
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setPostToDeleteId(null);
      setDeleteIsLoading(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    try {
      const res = await fetch(
        `/api/posts/${currentPost._id}/reply/${replyId}`,
        {
          method: 'DELETE',
        },
      );
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast('Success', 'Reply deleted successfully', 'success');

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === currentPost._id
            ? {
                ...post,
                replies: post.replies.filter((reply) => reply._id !== replyId),
              }
            : post,
        ),
      );
    } catch (error) {
      showToast('Error', error.message, 'error');
    }
  };

  const openDeleteModal = (postId) => {
    setPostToDeleteId(postId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setPostToDeleteId(null);
  };

  if (!user && loading) {
    return (
      <Flex justify={'center'}>
        <Spinner size={'xl'} />
      </Flex>
    );
  }

  if (!currentPost) return null;

  return (
    <>
      <Flex>
        <Flex w={'full'} alignItems={'center'} gap={3}>
          <Avatar
            src={user.profilePic}
            size={'md'}
            name={user.name}
            cursor={'pointer'}
            onClick={() => {
              navigate(`/${user.username}`);
            }}
          />
          <Flex>
            <Text
              fontSize={'sm'}
              fontWeight={'bold'}
              _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={() => {
                navigate(`/${user.username}`);
              }}
            >
              {user.username}
            </Text>
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={'center'}>
          <Text
            fontSize={'xs'}
            width={36}
            textAlign={'right'}
            color={'gray.light'}
          >
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>

          {currentUser?._id === user._id && (
            <DeleteIcon
              size={20}
              cursor={'pointer'}
              onClick={() => openDeleteModal(currentPost._id)}
            />
          )}
        </Flex>
      </Flex>
      <Text my={3}>{currentPost.text}</Text>
      {currentPost.img && (
        <Box
          borderRadius={6}
          overflow={'hidden'}
          border={'1px solid'}
          borderColor={'gray.light'}
        >
          <Image src={currentPost.img} w={'full'} />
        </Box>
      )}
      <Flex gap={3} my={3}>
        <Actions post={currentPost} />
      </Flex>
      <Divider my={4} borderColor={dividerColor} />

      <Flex justifyContent={'space-between'}>
        <Flex gap={2} alignItems={'center'}>
          <Text fontSize={'xl'}>💬</Text>
          <Text color={'gray.light'} fontWeight='bold'>
            Replies
          </Text>
        </Flex>
      </Flex>

      <Divider my={4} borderColor={dividerColor} />
      {currentPost.replies.map((reply, index) => (
        <Comment
          key={`${reply._id} ${index}`}
          reply={reply}
          lastReply={
            reply._id ===
            currentPost.replies[currentPost.replies.length - 1]._id
          }
          handleDeleteReply={handleDeleteReply}
        />
      ))}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this post?</ModalBody>

          <ModalFooter>
            <Button
              colorScheme='red'
              mr={3}
              isLoading={DeleteIsLoading}
              isDisabled={DeleteIsLoading}
              onClick={handleDeletePost}
            >
              Delete
            </Button>

            <Button
              variant='ghost'
              isDisabled={DeleteIsLoading}
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
