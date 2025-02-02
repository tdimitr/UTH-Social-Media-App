import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const showToast = useShowToast();

  // Retrieve email and code from localStorage
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');

  useEffect(() => {
    const resetData = JSON.parse(localStorage.getItem('resetPasswordData'));
    if (resetData && resetData.email && resetData.code) {
      setEmail(resetData.email);
      setCode(resetData.code);
    } else {
      // Redirect to auth if no data is found
      navigate('/auth');
    }
  }, [navigate]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  const handlePasswordReset = async () => {
    // Validate password and confirm password
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }
    setPasswordError('');

    const confirmPasswordValidationError = validateConfirmPassword(
      password,
      confirmPassword,
    );
    if (confirmPasswordValidationError) {
      setConfirmPasswordError(confirmPasswordValidationError);
      return;
    }
    setConfirmPasswordError('');

    setLoading(true);
    try {
      const res = await fetch('/api/users/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }), // Use localStorage values
      });

      const data = await res.json();

      if (data.message === 'Password reset successfully.') {
        showToast('Success', 'Password reset successfully.', 'success');
        localStorage.removeItem('resetPasswordData'); // Clear reset data
        navigate('/auth');
      } else {
        showToast('Error', data.error || 'Failed to reset password.', 'error');
      }
    } catch {
      showToast('Error', 'An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    password === confirmPassword &&
    !passwordError &&
    !confirmPasswordError;

  return (
    <Flex align={'center'} justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Reset Your Password
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.dark')}
          boxShadow={'lg'}
          p={8}
        >
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  onChange={(e) => {
                    const password = e.target.value;
                    setPassword(password);
                    setPasswordError(validatePassword(password));
                  }}
                  value={password}
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
                    setConfirmPassword(confirmPassword);
                    setConfirmPasswordError(
                      validateConfirmPassword(password, confirmPassword),
                    );
                  }}
                  value={confirmPassword}
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
                loadingText='Resetting..'
                size='lg'
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}
                onClick={handlePasswordReset}
                isLoading={loading}
                isDisabled={!isFormValid}
              >
                Reset Password
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
}
