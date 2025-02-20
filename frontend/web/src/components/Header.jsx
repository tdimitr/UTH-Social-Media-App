import {
  Button,
  Flex,
  Image,
  Link,
  useColorMode,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from '@chakra-ui/react';
import userAtom from '../atoms/userAtom';
import { useRecoilValue } from 'recoil';
import { RxAvatar } from 'react-icons/rx';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { Link as RouterLink } from 'react-router-dom';
import { FiLogOut, FiSettings } from 'react-icons/fi';
import { FaSnowflake } from 'react-icons/fa';
import useLogout from '../hooks/useLogout';
import { AiOutlineHome } from 'react-icons/ai';
import { SunIcon, MoonIcon } from '@chakra-ui/icons';

const Header = () => {
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const { colorMode, toggleColorMode } = useColorMode();

  const logoSrc = colorMode === 'dark' ? '/uthDark.svg' : '/uthLight.svg';

  return (
    <Flex justifyContent='space-between' alignItems={'center'} mt={6} mb={12}>
      <Flex alignItems='center' gap={4}>
        {user ? (
          <Link as={RouterLink} to={'/'} style={{ visibility: 'visible' }}>
            <AiOutlineHome size={28} />
          </Link>
        ) : (
          <Text fontSize='lg' fontWeight={'bold'} as={RouterLink} to='/auth'>
            Login/Signup
          </Text>
        )}

        {user && (
          <>
            <Link
              as={RouterLink}
              to={`/${user?.username}`}
              style={{ visibility: 'visible' }}
            >
              <RxAvatar size={28} />
            </Link>
            <Link as={RouterLink} to='/chat' style={{ visibility: 'visible' }}>
              <IoChatbubbleEllipsesOutline size={28} />
            </Link>
          </>
        )}
      </Flex>

      <Image alt='logo' src={logoSrc} w={16} flexShrink={0} />

      <Flex alignItems={'center'} gap={2}>
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiSettings />}
            aria-label='Settings'
            size='sm'
          />
          <MenuList>
            <MenuItem
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
            >
              {colorMode === 'light'
                ? 'Switch to Dark Mode'
                : 'Switch to Light Mode'}
            </MenuItem>

            {user && (
              <MenuItem icon={<FaSnowflake />} as={RouterLink} to='/freeze'>
                Freeze Account
              </MenuItem>
            )}
          </MenuList>
        </Menu>
        <Button
          size={'sm'}
          onClick={logout}
          style={{ visibility: user ? 'visible' : 'hidden' }}
        >
          <FiLogOut size={20} />
        </Button>
      </Flex>
    </Flex>
  );
};

export default Header;
