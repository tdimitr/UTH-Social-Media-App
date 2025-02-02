/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  Box,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
} from '@chakra-ui/react';
import {
  FiCopy,
  FiHeart,
  FiMessageCircle,
  FiSend,
  FiFacebook,
  FiTwitter,
  FiLinkedin,
} from 'react-icons/fi';
import { GoSmiley } from 'react-icons/go';
import EmojiMartPicker from '@emoji-mart/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import postsAtom from '../atoms/postsAtom';

const Actions = ({ post, postedBy }) => {
  const user = useRecoilValue(userAtom);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [isLiking, setIsLiking] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const showToast = useShowToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLikeAndUnlike = async () => {
    if (!user) {
      showToast('Error', 'You must be logged in to like a post', 'error');
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch('/api/posts/like/' + post._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) {
          return {
            ...p,
            likes: liked
              ? p.likes.filter((id) => id !== user._id)
              : [...p.likes, user._id],
          };
        }
        return p;
      });
      setPosts(updatedPosts);
      setLiked(!liked);
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async () => {
    if (!user) {
      showToast('Error', 'You must be logged in to comment on a post', 'error');
      return;
    }
    if (isReplying) return;
    setIsReplying(true);
    try {
      const res = await fetch('/api/posts/reply/' + post._id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: reply }),
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }

      // Add the returned reply with `_id` directly to the post's replies
      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) {
          return { ...p, replies: [...p.replies, data] };
        }
        return p;
      });
      setPosts(updatedPosts);
      showToast('Success', 'Reply posted successfully', 'success');
      onClose();
      setReply('');
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsReplying(false);
    }
  };

  const copyPostURL = async () => {
    const postUrl = `${window.location.origin}/${postedBy}/post/${post._id}`;
    try {
      await navigator.clipboard.writeText(postUrl);
      showToast(
        'URL copied to clipboard',
        'The post URL has been copied to your clipboard.',
        'success',
      );
    } catch {
      showToast('Error', 'Failed to copy the URL. Please try again.', 'error');
    }
  };

  const addEmoji = (emoji) => {
    setReply(reply + emoji.native);
  };

  // Social media sharing URLs
  const shareOnSocialMedia = (platform) => {
    const postUrl = `${window.location.origin}/${postedBy}/post/${post._id}`;
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          postUrl,
        )}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          postUrl,
        )}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
          postUrl,
        )}`;
        break;
      default:
        return;
    }
    window.open(shareUrl, '_blank', 'width=600, height=400');
  };

  return (
    <Flex flexDirection={'column'}>
      <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
        <FiHeart
          aria-label='Like'
          color={liked ? 'rgb(237, 73, 86)' : ''}
          fill={liked ? 'rgb(237, 73, 86)' : 'transparent'}
          size={20}
          onClick={handleLikeAndUnlike}
          style={{ cursor: 'pointer' }}
        />
        <FiMessageCircle
          aria-label='Comment'
          size={20}
          style={{ cursor: 'pointer' }}
          onClick={onOpen}
        />

        <Menu>
          <MenuButton>
            <FiSend
              aria-label='Share'
              size={20}
              style={{ cursor: 'pointer' }}
            />
          </MenuButton>
          <MenuList>
            <MenuItem onClick={copyPostURL}>
              <FiCopy size={20} style={{ marginRight: 8 }} />
              Copy Post URL
            </MenuItem>
            <MenuItem onClick={() => shareOnSocialMedia('facebook')}>
              <FiFacebook size={20} style={{ marginRight: 8 }} />
              Share on Facebook
            </MenuItem>
            <MenuItem onClick={() => shareOnSocialMedia('twitter')}>
              <FiTwitter size={20} style={{ marginRight: 8 }} />
              Share on X (Twitter)
            </MenuItem>
            <MenuItem onClick={() => shareOnSocialMedia('linkedin')}>
              <FiLinkedin size={20} style={{ marginRight: 8 }} />
              Share on LinkedIn
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      <Flex gap={2} alignItems={'center'}>
        <Text color={'gray.light'} fontSize={'sm'}>
          {post.likes.length} likes
        </Text>
        <Box w={0.5} h={0.5} borderRadius={'full'} bg={'gray.light'} />
        <Text color={'gray.light'} fontSize={'sm'}>
          {post.replies.length} replies
        </Text>
      </Flex>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Flex alignItems='flex-start'>
                <Input
                  placeholder='Reply goes here..'
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <Flex position='relative'>
                  <GoSmiley
                    size={20}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{ marginLeft: '8px', cursor: 'pointer' }}
                  />
                  {showEmojiPicker && (
                    <Box
                      position='absolute'
                      top='100%'
                      left='0'
                      mt={1}
                      zIndex={1000}
                    >
                      <EmojiMartPicker onEmojiSelect={addEmoji} />
                    </Box>
                  )}
                </Flex>
              </Flex>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme='blue'
              size={'sm'}
              mr={3}
              isLoading={isReplying}
              onClick={handleReply}
            >
              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Actions;
