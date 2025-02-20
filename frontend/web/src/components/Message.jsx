/* eslint-disable react/prop-types */
import {
  Avatar,
  Box,
  Flex,
  Image,
  Skeleton,
  Text,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import { selectedConversationAtom } from '../atoms/messagesAtom';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import { BsCheck2All } from 'react-icons/bs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Message = ({ ownMessage, message }) => {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const user = useRecoilValue(userAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const receivedMessageBg = useColorModeValue('gray.300', 'gray.500');
  const sentMessageBg = useColorModeValue('blue.600', 'blue.600');

  const navigate = useNavigate();

  return (
    <>
      {ownMessage ? (
        <Flex direction='column' alignSelf='flex-end' maxW='350px' gap={1}>
          <Flex align='center' gap={2}>
            {message.text && (
              <Flex
                bg={sentMessageBg}
                p={2}
                borderRadius='md'
                maxW='100%'
                wordBreak='break-word'
                overflowWrap='break-word'
              >
                <Text color='white'>{message.text}</Text>
              </Flex>
            )}
            {message.img && !imgLoaded && (
              <Flex mt={5} w={'200px'}>
                <Image
                  src={message.img}
                  hidden
                  onLoad={() => setImgLoaded(true)}
                  alt='Message image'
                  borderRadius={4}
                />
                <Skeleton w={'200px'} h={'200px'} />
              </Flex>
            )}

            {message.img && imgLoaded && (
              <Flex mt={5} w={'200px'}>
                <Image
                  src={message.img}
                  alt='Message image'
                  borderRadius={4}
                  cursor='pointer'
                  onClick={onOpen}
                />
              </Flex>
            )}
            <Avatar
              name={user.name}
              src={user.profilePic}
              cursor={'pointer'}
              onClick={() => {
                navigate(`/${user.username}`);
              }}
              w='7'
              h='7'
            />
          </Flex>

          <Flex align='center' justify='flex-end' mt={1} gap={1}>
            <Box color={message.seen ? 'blue.400' : 'gray.500'}>
              <BsCheck2All size={16} />
            </Box>
            <Text fontSize='sm' color={message.seen ? 'blue.400' : 'gray.500'}>
              {message.seen ? 'Seen' : 'Delivered'}
            </Text>
          </Flex>
        </Flex>
      ) : (
        <Flex maxW='350px' align='center' gap={2}>
          <Avatar
            name={selectedConversation.username}
            src={selectedConversation.userProfilePic}
            cursor={'pointer'}
            onClick={() => {
              navigate(`/${selectedConversation.username}`);
            }}
            w='7'
            h='7'
          />
          <Flex direction='column' gap={1} alignItems='flex-start'>
            {message.text && (
              <Text
                bg={receivedMessageBg}
                p={2}
                borderRadius='md'
                maxW='100%'
                wordBreak='break-word'
                overflowWrap='break-word'
              >
                {message.text}
              </Text>
            )}
            {message.img && (
              <Flex w={'200px'}>
                <Image
                  src={message.img}
                  alt='Message image'
                  borderRadius={4}
                  cursor='pointer'
                  onClick={onOpen}
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      )}

      {/* Modal for viewing the image */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent maxW='550px' bg='transparent' shadow='none'>
          <ModalCloseButton color='white' />
          <ModalBody p={1}>
            <Image
              src={message.img}
              alt='Expanded message image'
              borderRadius={4}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Message;
