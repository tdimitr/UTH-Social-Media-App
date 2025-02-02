import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { useRecoilState } from 'recoil';
import userAtom from '../atoms/userAtom';
import usePreviewImg from '../hooks/usePreviewImg';
import useShowToast from '../hooks/useShowToast';
import { useNavigate } from 'react-router-dom';

export const UpdateProfilePage = () => {
  const [user, setUser] = useRecoilState(userAtom);
  const [inputs, setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    bio: user.bio,
    password: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const fileRef = useRef(null);
  const [updating, setUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const showToast = useShowToast();
  const { handleImageChange, imgUrl } = usePreviewImg();
  const navigate = useNavigate();

  // Function to validate password
  const validatePassword = (password) => {
    if (password.length === 0) {
      return ''; // Allow empty password, meaning no change is intended
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    if (!/[a-zA-Z]/.test(password)) {
      return 'Password must contain at least one letter.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (updating) return;
    setUpdating(true);

    // Validate the password only if it's being changed
    const error = validatePassword(inputs.password);
    if (inputs.password.length > 0 && error) {
      setPasswordError(error);
      setUpdating(false);
      return;
    }
    setPasswordError('');

    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...inputs, profilePic: imgUrl }),
      });
      const data = await res.json();
      if (data.error) {
        showToast('Error', data.error, 'error');
        return;
      }
      showToast('Success', 'Profile updated successfully', 'success');
      localStorage.setItem('userInfo', JSON.stringify(data));
      setUser(data);
    } catch (error) {
      showToast('Error', error, 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex align={'center'} justify={'center'} my={6}>
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.dark')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
        >
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl' }}>
            User Profile Edit
          </Heading>
          <FormControl id='userName'>
            <Stack direction={['column', 'row']} spacing={6}>
              <Center>
                <Avatar
                  name={user.name}
                  size='xl'
                  boxShadow={'md'}
                  src={imgUrl || user.profilePic}
                />
              </Center>
              <Center w='full'>
                <Button w='full' onClick={() => fileRef.current.click()}>
                  Change Profile Picture
                </Button>
                <Input
                  type='file'
                  hidden
                  ref={fileRef}
                  onChange={handleImageChange}
                />
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Full name</FormLabel>
            <Input
              value={inputs.name}
              onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
              placeholder='John Doe'
              _placeholder={{ color: 'gray.500' }}
              type='text'
            />
          </FormControl>
          <FormControl>
            <FormLabel>User name</FormLabel>
            <Input
              value={inputs.username}
              onChange={(e) =>
                setInputs({ ...inputs, username: e.target.value })
              }
              placeholder='johndoe'
              _placeholder={{ color: 'gray.500' }}
              type='text'
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email address</FormLabel>
            <Input
              value={inputs.email}
              onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
              placeholder='your-email@example.com'
              _placeholder={{ color: 'gray.500' }}
              type='email'
            />
          </FormControl>
          <FormControl>
            <FormLabel>Bio</FormLabel>
            <Input
              value={inputs.bio}
              onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
              placeholder='Your bio.'
              _placeholder={{ color: 'gray.500' }}
              type='text'
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                value={inputs.password}
                onChange={(e) => {
                  const password = e.target.value;
                  setInputs({ ...inputs, password });
                  setPasswordError(validatePassword(password));
                }}
                placeholder='password'
                _placeholder={{ color: 'gray.500' }}
                type={showPassword ? 'text' : 'password'}
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
          <Stack spacing={6} direction={['column', 'row']}>
            <Button
              bg={'red.400'}
              color={'white'}
              w='full'
              _hover={{
                bg: 'red.500',
              }}
              onClick={() => navigate(`/${user.username}`)}
            >
              Cancel
            </Button>

            <Button
              bg={'blue.400'}
              color={'white'}
              w='full'
              _hover={{
                bg: 'blue.500',
              }}
              type='submit'
              isLoading={updating}
            >
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
};
