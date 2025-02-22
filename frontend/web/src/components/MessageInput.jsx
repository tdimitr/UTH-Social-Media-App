/* eslint-disable react/prop-types */
import { useRef, useState } from 'react';
import {
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Box,
  useDisclosure,
  useColorModeValue,
} from '@chakra-ui/react';
import { LuSendHorizonal } from 'react-icons/lu';
import { PiImagesSquareFill } from 'react-icons/pi';
import { GoSmiley } from 'react-icons/go';
import EmojiMartPicker from '@emoji-mart/react';
import useShowToast from '../hooks/useShowToast';
import usePreviewImg from '../hooks/usePreviewImg';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  conversationsAtom,
  selectedConversationAtom,
} from '../atoms/messagesAtom';

const MessageInput = ({ setMessages }) => {
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const setConversations = useSetRecoilState(conversationsAtom);
  const imageRef = useRef(null);
  const { onClose } = useDisclosure();
  const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText && !imgUrl) return;
    if (isSending) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          recipientId: selectedConversation.userId,
          img: imgUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      setMessages((messages) => [...messages, data]);

      setConversations((prevConvs) => {
        const updatedConversations = prevConvs.map((conversation) => {
          if (conversation._id === selectedConversation._id) {
            return {
              ...conversation,
              lastMessage: {
                text: messageText,
                sender: data.sender,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
      setMessageText('');
      setImgUrl('');
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const addEmoji = (emoji) => {
    setMessageText(messageText + emoji.native);
  };

  return (
    <Flex gap={2} alignItems={'center'}>
      <form onSubmit={handleSendMessage} style={{ flex: 95 }}>
        <InputGroup>
          <Input
            w={'full'}
            placeholder='Type a message..'
            onChange={(e) => setMessageText(e.target.value)}
            value={messageText}
            borderColor={useColorModeValue('gray.400', 'gray.600')}
          />
          <InputRightElement onClick={handleSendMessage} cursor={'pointer'}>
            <LuSendHorizonal />
          </InputRightElement>
        </InputGroup>
      </form>
      <Flex flex={5} cursor={'pointer'} alignItems='center'>
        <PiImagesSquareFill
          size={20}
          onClick={() => imageRef.current.click()}
        />
        <Input
          type={'file'}
          hidden
          ref={imageRef}
          onChange={handleImageChange}
        />
        <GoSmiley
          size={20}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          style={{ marginLeft: '8px', cursor: 'pointer' }}
        />
        {showEmojiPicker && (
          <Box position='absolute' bottom='50px' right='10px' zIndex='10'>
            <EmojiMartPicker onEmojiSelect={addEmoji} />
          </Box>
        )}
      </Flex>
      <Modal
        isOpen={imgUrl}
        onClose={() => {
          onClose();
          setImgUrl('');
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mt={5} w={'full'}>
              <Image src={imgUrl} />
            </Flex>
            <Flex justifyContent={'flex-end'} my={2}>
              {!isSending ? (
                <LuSendHorizonal
                  size={20}
                  cursor={'pointer'}
                  onClick={handleSendMessage}
                />
              ) : (
                <Spinner size={'md'} />
              )}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default MessageInput;
