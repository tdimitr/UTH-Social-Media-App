import { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Spinner,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { CheckCircleIcon } from '@chakra-ui/icons';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';

const VerifyResetCodePage = () => {
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false); // State for resend button
  const showToast = useShowToast();
  const navigate = useNavigate();

  // Get email and code from localStorage
  const resetData = JSON.parse(localStorage.getItem('resetPasswordData')) || {
    email: '',
    code: '',
  };

  useEffect(() => {
    if (!resetData.email) {
      navigate('/auth'); // Redirect to auth page if no email is found in localStorage
    }
  }, [resetData.email, navigate]);

  // Handle Reset Code Verification
  const handleResetCodeVerification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/verifyResetCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email, code: resetCode }),
      });

      const data = await response.json();

      if (data.message === 'Reset code verified successfully.') {
        localStorage.setItem(
          'resetPasswordData',
          JSON.stringify({ ...resetData, code: resetCode }),
        );
        showToast(
          'Success',
          'Reset code verified. You can now reset your password.',
          'success',
        );
        navigate('/resetPassword');
      } else {
        showToast('Error', data.error || 'Verification failed.', 'error');
      }
    } catch (error) {
      console.error('Error during reset code verification:', error);
      showToast('Error', 'An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Reset Code
  const handleResendResetCode = async () => {
    setResendLoading(true);
    try {
      const response = await fetch('/api/users/resendResetPasswordCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetData.email }),
      });

      const data = await response.json();
      if (response.ok) {
        showToast(
          'Success',
          'A new reset code has been sent to your email.',
          'success',
        );
      } else {
        showToast(
          'Error',
          data.error || 'Failed to resend reset code.',
          'error',
        );
      }
    } catch (error) {
      console.error('Error during resend:', error);
      showToast('Error', 'An error occurred. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Flex align='center' justify='center' minH='70vh'>
      <Box
        w={{ base: '100%', md: '70%', lg: '60%' }}
        bg={useColorModeValue('white', 'gray.dark')}
        p={12}
        rounded='lg'
        boxShadow='2xl'
      >
        <VStack spacing={8} align='center'>
          <CheckCircleIcon w={14} h={14} color='blue.400' />
          <Heading fontSize='xl'>Verify Reset Code</Heading>
          <Text fontSize='md' textAlign='center'>
            Enter the 6-digit code sent to your email to reset your password.
          </Text>

          <Input
            placeholder='Enter reset code'
            maxLength={6}
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            textAlign='center'
            size='lg'
            variant='filled'
            isRequired
          />

          <Button
            bg={'blue.400'}
            color={'white'}
            _hover={{
              bg: 'blue.500',
            }}
            onClick={handleResetCodeVerification}
            isLoading={loading}
            isDisabled={!resetCode}
            w='full'
          >
            {loading ? <Spinner size='sm' /> : 'Verify Reset Code'}
          </Button>

          {/* Resend Reset Code Link */}
          <Link
            color='blue.400'
            onClick={handleResendResetCode}
            isDisabled={resendLoading}
          >
            {resendLoading ? <Spinner size='sm' /> : 'Resend Reset Code'}
          </Link>
        </VStack>
      </Box>
    </Flex>
  );
};

export default VerifyResetCodePage;
