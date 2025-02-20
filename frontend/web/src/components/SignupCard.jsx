import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useSetRecoilState } from 'recoil';
import authScreenAtom from '../atoms/authAtom';
import useShowToast from '../hooks/useShowToast';
import userAtom from '../atoms/userAtom';
import isEmail from 'validator/lib/isEmail.js';
import verifyAtom from '../atoms/verifyAtom';

export default function SignupCard() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const setAuthScreen = useSetRecoilState(authScreenAtom);
  const [inputs, setInputs] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const showToast = useShowToast();
  const setUser = useSetRecoilState(userAtom);

  const setVerify = useSetRecoilState(verifyAtom);

  // Function to validate password
  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/[a-zA-Z]/.test(password)) {
      return 'Password must contain at least one letter.';
    }
    return '';
  };

  // Function to validate confirm password
  const validateConfirmPassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSignup = async () => {
    // Validate email and password on submission
    if (!isEmail(inputs.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setEmailError('');

    const error = validatePassword(inputs.password);
    if (error) {
      setPasswordError(error);
      return;
    }
    setPasswordError('');

    const confirmPasswordError = validateConfirmPassword(
      inputs.password,
      inputs.confirmPassword,
    );
    if (confirmPasswordError) {
      setConfirmPasswordError(confirmPasswordError);
      return;
    }
    setConfirmPasswordError('');

    setLoading(true);
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }

      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
      setVerify(false);
      showToast(
        'Account created.',
        "We've created an account for you.",
        'success',
      );
    } catch (error) {
      showToast('Error', error, 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    inputs.name.trim() !== '' &&
    inputs.username.trim() !== '' &&
    inputs.email.trim() !== '' &&
    inputs.password.trim() !== '' &&
    inputs.confirmPassword.trim() !== '' &&
    inputs.password === inputs.confirmPassword;

  return (
    <Flex align={'center'} justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Sign Up
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.dark')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}>
            <HStack>
              <Box>
                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    type='text'
                    onChange={(e) =>
                      setInputs({ ...inputs, name: e.target.value })
                    }
                    value={inputs.name}
                  />
                </FormControl>
              </Box>
              <Box>
                <FormControl isRequired>
                  <FormLabel>Username</FormLabel>
                  <Input
                    type='text'
                    onChange={(e) =>
                      setInputs({ ...inputs, username: e.target.value })
                    }
                    value={inputs.username}
                  />
                </FormControl>
              </Box>
            </HStack>
            <FormControl isRequired>
              <FormLabel>Email Address</FormLabel>
              <Input
                type='email'
                onChange={(e) => {
                  const email = e.target.value;
                  setInputs({ ...inputs, email });

                  if (!isEmail(email) && email !== '') {
                    setEmailError('Please enter a valid email address.');
                  } else {
                    setEmailError('');
                  }
                }}
                value={inputs.email}
              />
              {emailError && <Text color='red.500'>{emailError}</Text>}
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  onChange={(e) => {
                    const password = e.target.value;
                    setInputs({ ...inputs, password });
                    setPasswordError(validatePassword(password));
                  }}
                  value={inputs.password}
                />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                  >
                    {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {passwordError && <Text color='red.500'>{passwordError}</Text>}
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  onChange={(e) => {
                    const confirmPassword = e.target.value;
                    setInputs({ ...inputs, confirmPassword });
                    setConfirmPasswordError(
                      validateConfirmPassword(inputs.password, confirmPassword),
                    );
                  }}
                  value={inputs.confirmPassword}
                />
                <InputRightElement h={'full'}>
                  <Button
                    variant={'ghost'}
                    onClick={() =>
                      setShowConfirmPassword(
                        (showConfirmPassword) => !showConfirmPassword,
                      )
                    }
                  >
                    {showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              {confirmPasswordError && (
                <Text color='red.500'>{confirmPasswordError}</Text>
              )}
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                loadingText='Signing Up..'
                size='lg'
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handleSignup}
                isLoading={loading}
                isDisabled={!isFormValid}
              >
                Sign up
              </Button>
            </Stack>
            <Stack pt={6}>
              <Text align={'center'}>
                Already a user?{' '}
                <Link color={'blue.400'} onClick={() => setAuthScreen('login')}>
                  Login
                </Link>
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
