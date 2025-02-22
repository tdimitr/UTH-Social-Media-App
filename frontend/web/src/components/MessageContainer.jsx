import {
  Avatar,
  Divider,
  Flex,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import Message from './Message';
import MessageInput from './MessageInput';
import { useEffect, useRef, useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  conversationsAtom,
  selectedConversationAtom,
} from '../atoms/messagesAtom';
import userAtom from '../atoms/userAtom';
import { useSocket } from '../context/SocketContext.jsx';
import messageSound from '../assets/message.mp3';
import { useNavigate } from 'react-router-dom';

const MessageContainer = () => {
  const showToast = useShowToast();
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const currentUser = useRecoilValue(userAtom);
  const { socket } = useSocket();
  const setConversations = useSetRecoilState(conversationsAtom);
  const messageEndRef = useRef(null);

  const navigate = useNavigate();

  // Real-time messages
  useEffect(() => {
    socket.on('newMessage', (message) => {
      if (selectedConversation._id === message.conversationId) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }

      if (!document.hasFocus()) {
        const sound = new Audio(messageSound);
        sound.play();
      }

      // Update latest messages in conversation
      setConversations((prevConversations) => {
        return prevConversations.map((conversation) => {
          if (conversation._id === message.conversationId) {
            return {
              ...conversation,
              lastMessage: {
                text: message.text,
                sender: message.sender,
              },
            };
          }
          return conversation;
        });
      });
    });

    return () => socket.off('newMessage');
  }, [socket, selectedConversation, setConversations]);

  // Fetch messages when conversation changes
  useEffect(() => {
    const getMessages = async () => {
      setLoadingMessages(true);
      setMessages([]);
      try {
        if (selectedConversation.mock) return;
        const res = await fetch(`/api/messages/${selectedConversation.userId}`);
        const data = await res.json();
        if (data.error) {
          showToast('Error', data.error, 'error');
          return;
        }
        setMessages(data);
      } catch (error) {
        showToast('Error', error.message, 'error');
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [showToast, selectedConversation.userId, selectedConversation.mock]);

  // Mark messages as seen
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageIsFromOtherUser =
        lastMessage.sender !== currentUser._id && !lastMessage.seen;

      if (lastMessageIsFromOtherUser) {
        // Emit only if the last message is unread and from the other user
        socket.emit('markMessagesAsSeen', {
          conversationId: selectedConversation._id,
          userId: currentUser._id, // Current user's ID
        });
      }
    }

    socket.on('messagesSeen', ({ conversationId }) => {
      if (selectedConversation._id === conversationId) {
        setMessages((prevMessages) =>
          prevMessages.map((message) => ({
            ...message,
            seen: true,
          })),
        );
      }
    });

    return () => {
      socket.off('messagesSeen'); // Cleanup on unmount
    };
  }, [socket, currentUser._id, messages, selectedConversation]);

  // Smooth scroll to the latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Flex
      flex='70'
      bg={useColorModeValue('gray.200', 'gray.800')}
      borderRadius={'md'}
      p={2}
      flexDirection={'column'}
    >
      {/* Message Header */}
      <Flex w={'full'} h={12} alignItems={'center'} gap={2}>
        <Avatar
          name={selectedConversation.username}
          src={selectedConversation.userProfilePic}
          size={'sm'}
          cursor={'pointer'}
          onClick={() => {
            navigate(`/${selectedConversation.username}`);
          }}
        />
        <Text
          display={'flex'}
          alignItems={'center'}
          _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
          onClick={() => {
            navigate(`/${selectedConversation.username}`);
          }}
        >
          {selectedConversation.username}
        </Text>
      </Flex>

      <Divider borderColor={useColorModeValue('gray.400', 'gray.600')} />

      {/* Messages */}
      <Flex
        flexDir={'column'}
        gap={4}
        my={4}
        px={4}
        py={2}
        height={'400px'}
        overflowY={'auto'}
      >
        {loadingMessages &&
          [0, 1, 2, 3, 4].map((_, i) => (
            <Flex
              key={i}
              gap={2}
              alignItems={'center'}
              p={1}
              borderRadius={'md'}
              alignSelf={i % 2 === 0 ? 'flex-start' : 'flex-end'}
            >
              {i % 2 === 0 && <SkeletonCircle size={7} />}
              <Flex flexDir={'column'} gap={2}>
                <Skeleton h='8px' w='250px' />
                <Skeleton h='8px' w='250px' />
                <Skeleton h='8px' w='250px' />
              </Flex>
              {i % 2 !== 0 && <SkeletonCircle size={7} />}
            </Flex>
          ))}

        {!loadingMessages &&
          messages.map((message) => (
            <Flex
              key={message._id}
              direction={'column'}
              ref={
                messages.length - 1 === messages.indexOf(message)
                  ? messageEndRef
                  : null
              }
            >
              <Message
                message={message}
                ownMessage={currentUser._id === message.sender}
              />
            </Flex>
          ))}
      </Flex>

      <MessageInput setMessages={setMessages} />
    </Flex>
  );
};

export default MessageContainer;
