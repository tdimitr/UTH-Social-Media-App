/* eslint-disable react/prop-types */
import { Image, Text, Box, Flex, Avatar } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import Actions from './Actions';
import { useEffect, useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { formatDistanceToNow } from 'date-fns';
import { DeleteIcon } from '@chakra-ui/icons';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import postsAtom from '../atoms/postsAtom';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();
  const [loading, isLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch('/api/users/profile/' + postedBy);
        const data = await res.json();
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        setUser(data);
      } catch (error) {
        showToast('Error', error.message, 'error');
        setUser(null);
      }
    };
    getUser();
  }, [postedBy, showToast]);

  const openDeleteModal = () => setIsDeleteModalOpen(true);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const handleDeletePost = async () => {
    isLoading(true);
    try {
      const res = await fetch(`/api/posts/delete/${post._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast('Success', 'Post deleted successfully', 'success');
      setPosts(posts.filter((p) => p._id !== post._id));
      closeDeleteModal();
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      isLoading(false);
    }
  };

  const handleNavigateToPostPage = (e) => {
    // Prevent navigation if the click is on interactive elements
    if (
      e.target.closest('.action-icons') ||
      e.target.closest('.username') ||
      e.target.closest('.avatar') ||
      e.target.closest('.delete-icon')
    ) {
      e.stopPropagation();
      return;
    }
    navigate(`/${user.username}/post/${post._id}`);
  };

  if (!user) return null;

  return (
    <Box mb={4} py={5} onClick={handleNavigateToPostPage} cursor='pointer'>
      <Flex gap={3}>
        <Flex flexDirection={'column'} alignItems={'center'}>
          <Avatar
            className='avatar'
            size='md'
            name={user.name}
            src={user?.profilePic}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/${user.username}`);
            }}
            cursor='pointer'
          />
          <Box w='1px' h='full' bg='gray.light' my='2'></Box>
        </Flex>
        <Flex flex={1} flexDirection={'column'} gap={2}>
          <Flex justifyContent={'space-between'} w={'full'}>
            <Text
              className='username'
              fontSize={'sm'}
              fontWeight={'bold'}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/${user.username}`);
              }}
              _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              {user?.username}
            </Text>
            <Flex gap={4} alignItems={'center'}>
              <Text fontSize={'xs'} color={'gray.light'}>
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </Text>
              {currentUser?._id === user._id && (
                <DeleteIcon
                  className='delete-icon'
                  size={20}
                  cursor='pointer'
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteModal();
                  }}
                />
              )}
            </Flex>
          </Flex>
          <Text fontSize={'sm'}>{post.text}</Text>
          {post.img && (
            <Box
              borderRadius={6}
              overflow={'hidden'}
              border='1px solid'
              borderColor='gray.light'
            >
              <Image src={post.img} w='full' />
            </Box>
          )}
          <Box className='action-icons' onClick={(e) => e.stopPropagation()}>
            <Actions post={post} postedBy={postedBy} />
          </Box>
        </Flex>
      </Flex>

      {/* Delete Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Post</ModalHeader>
          <ModalBody>Are you sure you want to delete this post?</ModalBody>
          <ModalFooter>
            <Button
              isLoading={loading}
              colorScheme='red'
              onClick={handleDeletePost}
              mr={3}
            >
              Delete
            </Button>
            <Button
              isDisabled={loading}
              variant='ghost'
              onClick={closeDeleteModal}
            >
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Post;
