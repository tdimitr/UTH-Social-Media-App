import { useState } from 'react';
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
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { CheckCircleIcon } from '@chakra-ui/icons';
import userAtom from '../atoms/userAtom';
import useShowToast from '../hooks/useShowToast';
import verifyAtom from '../atoms/verifyAtom';

const VerifyEmailPage = () => {
  const user = useRecoilValue(userAtom);

  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const showToast = useShowToast();
  const setVerify = useSetRecoilState(verifyAtom);

  // Handle Verification
  const handleVerification = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, code: verificationCode }),
      });

      const data = await response.json();

      if (data.isVerified) {
        setVerify(true);
        showToast('Success', 'Email verified successfully', 'success');
      } else {
        showToast('Error', data.error || 'Verification failed.', 'error');
      }
    } catch {
      showToast('Error', 'An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend Verification Code
  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      const response = await fetch('/api/users/resendVerificationCode');

      const data = await response.json();
      if (response.ok) {
        showToast(
          'Success',
          'A new verification code has been sent to your email.',
          'success',
        );
      } else {
        showToast('Error', data.error || 'Failed to resend code.', 'error');
      }
    } catch {
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
          <Heading fontSize='xl'>Verify Your Email</Heading>
          <Text fontSize='md' textAlign='center'>
            Enter the 6-digit code sent to your email to verify your account.
          </Text>

          <Input
            placeholder='Enter verification code'
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
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
            onClick={handleVerification}
            isLoading={loading}
            isDisabled={!verificationCode}
            w='full'
          >
            {loading ? <Spinner size='sm' /> : 'Verify Email'}
          </Button>

          <Link
            color='blue.400'
            onClick={handleResendCode}
            isDisabled={resendLoading}
          >
            {resendLoading ? <Spinner size='sm' /> : 'Resend Verification Code'}
          </Link>
        </VStack>
      </Box>
    </Flex>
  );
};

export default VerifyEmailPage;
