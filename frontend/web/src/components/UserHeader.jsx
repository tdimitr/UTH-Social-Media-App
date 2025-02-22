/* eslint-disable react/prop-types */
import {
  Box,
  Flex,
  Link,
  Text,
  VStack,
  Portal,
  Button,
  useDisclosure,
  useColorMode,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { CgMoreO } from 'react-icons/cg';
import useShowToast from '../hooks/useShowToast';
import { useRecoilValue } from 'recoil';
import userAtom from '../atoms/userAtom';
import { Link as RouterLink } from 'react-router-dom';
import { FiCopy } from 'react-icons/fi';
import useFollowUnfollow from '../hooks/useFollowUnfollow';
import { useEffect, useState } from 'react';
import FollowersModal from './FollowersModal';

const UserHeader = ({ user, activeTab, setActiveTab }) => {
  const showToast = useShowToast();
  const currentUser = useRecoilValue(userAtom); // logged in user
  const { handleFollowUnfollow, updating, following } = useFollowUnfollow(user);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [followerDetails, setFollowerDetails] = useState([]);

  // change color of border when tab is active
  const { colorMode } = useColorMode();
  const activeBorderColor = colorMode === 'dark' ? 'white' : 'black';
  const inactiveBorderColor = 'gray';

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      showToast(
        'URL copied to clipboard',
        'The current URL has been copied to your clipboard.',
        'success',
      );
    });
  };

  // for each Follower user have, found the Username and Picture (for the Modal)
  useEffect(() => {
    const getFollowerDetails = async () => {
      try {
        const followerPromises = user.followers.map((followerId) =>
          fetch(`/api/users/profile/${followerId}`).then((res) => res.json()),
        );

        const followersData = await Promise.all(followerPromises);
        setFollowerDetails(followersData);
      } catch (error) {
        showToast('Error', error.message, 'error');
      }
    };

    getFollowerDetails();
  }, [user.followers, showToast]);

  return (
    <VStack gap={4} alignItems={'start'}>
      <Flex justifyContent={'space-between'} w={'full'}>
        <Box>
          <Text fontSize={'2xl'} fontWeight={'bold'}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={'center'}>
            <Text fontSize={'sm'}>@{user.username}</Text>
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: 'md',
                md: 'lg',
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src=''
              size={{
                base: 'md',
                md: 'lg',
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      {currentUser?._id === user._id && (
        <Link as={RouterLink} to='/update'>
          <Button size={'sm'}>Update Profile</Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
        <Button size={'sm'} onClick={handleFollowUnfollow} isLoading={updating}>
          {following ? 'Unfollow' : 'Follow'}
        </Button>
      )}
      <Flex w={'full'} justifyContent={'space-between'}>
        <Flex gap={2} alignItems={'center'}>
          <Text
            color={'gray.light'}
            _hover={{ textDecoration: 'underline', cursor: 'pointer' }}
            onClick={onOpen}
          >
            {user.followers.length} followers
          </Text>
          <Box w='1' h='1' bg='gray.light' borderRadius={'full'}></Box>
          <Link color={'gray.light'} href='https://www.e-ce.uth.gr/' isExternal>
            e-ce.uth.gr
          </Link>
        </Flex>
        <Flex>
          <Box className='icon-container' ml={2}>
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={'pointer'} />
              </MenuButton>
              <Portal>
                <MenuList>
                  <MenuItem onClick={copyURL}>
                    <FiCopy size={20} style={{ marginRight: 8 }} />
                    Copy Profile URL
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      {/* Posts And Replies Header */}
      <Flex w='full'>
        <Flex
          flex={1}
          borderBottom={
            activeTab === 'posts'
              ? `1.5px solid ${activeBorderColor}`
              : `1px solid ${inactiveBorderColor}`
          }
          justifyContent='center'
          pb='3'
          cursor='pointer'
          onClick={() => setActiveTab('posts')}
        >
          <Text
            fontWeight='bold'
            color={activeTab === 'posts' ? activeBorderColor : 'gray.500'}
          >
            Posts
          </Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={
            activeTab === 'replies'
              ? `1.5px solid ${activeBorderColor}`
              : `1px solid ${inactiveBorderColor}`
          }
          justifyContent='center'
          pb='3'
          cursor='pointer'
          onClick={() => setActiveTab('replies')}
        >
          <Text
            fontWeight='bold'
            color={activeTab === 'replies' ? activeBorderColor : 'gray.500'}
          >
            Replies
          </Text>
        </Flex>
      </Flex>

      <FollowersModal
        isOpen={isOpen}
        onClose={onClose}
        followers={followerDetails}
      />
    </VStack>
  );
};

export default UserHeader;
