import {
  Button,
  Text,
  VStack,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaSnowflake } from 'react-icons/fa';
import useShowToast from '../hooks/useShowToast';
import useLogout from '../hooks/useLogout';
import { useState } from 'react';

const FreezePage = () => {
  const showToast = useShowToast();
  const logout = useLogout();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isFreezing, setIsFreezing] = useState(false);

  const freezeAccount = async () => {
    setIsFreezing(true);

    try {
      const res = await fetch('/api/users/freeze', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.error) {
        showToast(data.error);
        return;
      }
      if (data.success) {
        await logout();
        showToast('Success', 'Your account has been frozen', 'success');
      }
    } catch (error) {
      showToast('Error', error.message, 'error');
    } finally {
      setIsFreezing(false);
      onClose();
    }
  };

  return (
    <VStack
      spacing={4}
      mt={10}
      align='center'
      borderWidth={1}
      borderRadius='md'
      padding={6}
      boxShadow='lg'
      width='100%'
      maxWidth='400px'
      margin='0 auto'
    >
      <Icon as={FaSnowflake} boxSize={12} color='blue.400' />
      <Text fontSize='2xl' fontWeight='bold'>
        Freeze Your Account
      </Text>
      <Text fontSize='md' color='gray.600' textAlign='center' width='80%'>
        Freezing your account will temporarily deactivate it.
      </Text>
      <Text fontSize='sm' color='gray.500' textAlign='center' width='80%'>
        To reactivate your account, simply log back in at any time. Your data
        and settings will be saved while your account is frozen.
      </Text>
      <Button size='md' colorScheme='blue' onClick={onOpen}>
        Freeze Account
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Freeze</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to freeze your account? This action is
              temporary.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme='blue'
              mr={3}
              onClick={freezeAccount}
              isLoading={isFreezing}
            >
              Confirm
            </Button>
            <Button variant='ghost' onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default FreezePage;
