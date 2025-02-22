import {
  Box,
  Button,
  CloseButton,
  Flex,
  FormControl,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { PiImagesSquareFill } from 'react-icons/pi';
import { GoSmiley } from 'react-icons/go';
import EmojiMartPicker from '@emoji-mart/react';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import postsAtom from '../atoms/postsAtom';
import usePreviewImg from '../hooks/usePreviewImg';
import { useParams } from 'react-router-dom';
import { AddIcon } from '@chakra-ui/icons';
import { useRef, useState } from 'react';

const MAX_CHAR = 500;

const CreatePost = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postText, setPostText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [remainingChar, setRemainingChar] = useState(MAX_CHAR);
  const [loading, setLoading] = useState(false);
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();
  const imageRef = useRef(null);
  const user = useRecoilValue(userAtom);
  const showToast = useShowToast();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const { username } = useParams();

  const colorMode = useColorMode();

  const handleTextChange = (e) => {
    const inputText = e.target.value;
    if (inputText.length <= MAX_CHAR) {
      setPostText(inputText);
      setRemainingChar(MAX_CHAR - inputText.length);
    }
  };

  const addEmoji = (emoji) => {
    const newText = postText + emoji.native;
    if (newText.length <= MAX_CHAR) {
      setPostText(newText);
      setRemainingChar(MAX_CHAR - newText.length);
    }
  };

  const handleCreatePost = async () => {
    if (!postText.trim()) {
      showToast('Warning', 'Post content cannot be empty.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postedBy: user._id,
          text: postText,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast('Success', 'Post created successfully', 'success');
      if (username === user.username) setPosts([data, ...posts]);

      onClose();
      setPostText('');
      setImgUrl('');
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        position={'fixed'}
        bottom={10}
        right={10}
        leftIcon={<AddIcon />}
        bg={useColorModeValue('gray.300', 'gray.dark')}
        onClick={onOpen}
      >
        Post
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Flex alignItems='flex-start'>
                <Textarea
                  placeholder='Post content goes here..'
                  onChange={handleTextChange}
                  value={postText}
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
                      zIndex={1000} // Ensures the emoji picker appears above other elements
                    >
                      <EmojiMartPicker onEmojiSelect={addEmoji} />
                    </Box>
                  )}
                </Flex>
              </Flex>
              <Text
                fontSize='xs'
                fontWeight='bold'
                textAlign={'right'}
                m={'1'}
                color={colorMode === 'light' ? 'gray.800' : 'white.800'}
              >
                {remainingChar}/{MAX_CHAR}
              </Text>
              <Input
                type='file'
                hidden
                ref={imageRef}
                onChange={handleImageChange}
              />
              <PiImagesSquareFill
                style={{ marginLeft: '5px', cursor: 'pointer' }}
                size={20}
                onClick={() => imageRef.current.click()}
              />
            </FormControl>

            {imgUrl && (
              <Flex mt={5} w={'full'} position={'relative'}>
                <Image src={imgUrl} alt='Selected img' />
                <CloseButton
                  onClick={() => setImgUrl('')}
                  bg={'gray.800'}
                  color={'white'}
                  position={'absolute'}
                  top={2}
                  right={2}
                />
              </Flex>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={handleCreatePost}
              isLoading={loading}
              isDisabled={!postText.trim()}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreatePost;
