/* eslint-disable react/prop-types */
import { useState } from 'react';
import {
  useColorModeValue,
  Divider,
  Flex,
  Text,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import { DeleteIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const Comments = ({ reply, lastReply, handleDeleteReply }) => {
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [replyToDeleteId, setReplyToDeleteId] = useState(null);

  const dividerColor = useColorModeValue('gray.400', 'gray.600');

  const openDeleteModal = (replyId) => {
    setReplyToDeleteId(replyId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setReplyToDeleteId(null);
  };

  const handleDeleteConfirmation = () => {
    if (replyToDeleteId) {
      handleDeleteReply(replyToDeleteId);
      closeDeleteModal();
    }
  };

  return (
    <>
      <Flex gap={4} py={2} my={2} w={'full'}>
        <Avatar
          name={reply.username}
          src={reply.userProfilePic}
          size={'sm'}
          cursor='pointer'
          onClick={() => navigate(`/${reply.username}`)}
        />
        <Flex gap={1} w={'full'} flexDirection={'column'}>
          <Flex
            w={'full'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Text
              fontSize={'sm'}
              fontWeight={'bold'}
              cursor='pointer'
              _hover={{ textDecoration: 'underline' }}
              onClick={() => navigate(`/${reply.username}`)}
            >
              {reply.username}
            </Text>
            {currentUser?._id === reply.userId && (
              <DeleteIcon
                size={20}
                cursor={'pointer'}
                onClick={() => openDeleteModal(reply._id)}
              />
            )}
          </Flex>
          <Text>{reply.text}</Text>
        </Flex>
      </Flex>
      {!lastReply ? <Divider borderColor={dividerColor} /> : null}

      {/* Modal for confirming reply deletion */}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Reply</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Are you sure you want to delete this reply?</ModalBody>

          <ModalFooter>
            <Button colorScheme='red' mr={3} onClick={handleDeleteConfirmation}>
              Delete
            </Button>
            <Button variant='ghost' onClick={closeDeleteModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Comments;
