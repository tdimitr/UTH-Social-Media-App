import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { useSetRecoilState } from 'recoil';
import authScreenAtom from '../atoms/authAtom';
import { useState } from 'react';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';
import { resetPasswordAtom } from '../atoms/resetPasswordAtom';

export default function ForgotPasswordCard() {
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const showToast = useShowToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setResetData = useSetRecoilState(resetPasswordAtom);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
      } else {
        setResetData({ email, code: '' });
        localStorage.setItem(
          'resetPasswordData',
          JSON.stringify({ email, code: '' }),
        );
        showToast(
          'Success',
          'Password reset code sent to your email',
          'success',
        );
        navigate('/verifyResetCode');
      }
    } catch {
      showToast('Error', 'An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex align={'center'} justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Forgot Password
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.dark')}
          boxShadow={'lg'}
          p={8}
          w={{
            base: 'full',
            sm: '400px',
          }}
        >
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FormControl>

            <Stack spacing={10} pt={2}>
              <Button
                loadingText='Sending...'
                size='lg'
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handleSubmit}
                isLoading={loading}
                isDisabled={!email}
              >
                Send Reset Code
              </Button>
            </Stack>

            <Stack pt={6}>
              <Text align={'center'}>
                Remembered your password?{' '}
                <Text
                  as='span'
                  color={'blue.400'}
                  onClick={() => setAuthScreen('login')}
                  cursor='pointer'
                >
                  Log In
                </Text>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
