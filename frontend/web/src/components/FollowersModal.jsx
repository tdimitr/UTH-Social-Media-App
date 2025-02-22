/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  Flex,
  Avatar,
  Text,
} from '@chakra-ui/react';

const FollowersModal = ({ isOpen, onClose, followers }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size='lg'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Followers</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxHeight='320px' overflowY='auto'>
          <VStack spacing={4} align='start'>
            {followers.length === 0 ? (
              <Text fontWeight='medium' color='gray.500' mb={4}>
                This user has no followers.
              </Text>
            ) : (
              followers.map((follower, index) => (
                <Flex
                  key={`${follower._id}-${index}`}
                  align='center'
                  width='full'
                >
                  <Flex display='flex' alignItems='center' cursor='pointer'>
                    <Avatar
                      name={follower.username}
                      src={follower.profilePic || ''}
                      mr={4}
                    />
                    <Text fontWeight='medium'>{follower.username}</Text>
                  </Flex>
                </Flex>
              ))
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default FollowersModal;
