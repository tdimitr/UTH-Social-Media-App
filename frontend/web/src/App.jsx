import { Box, Container } from '@chakra-ui/react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { UserPage } from './pages/UserPage.jsx';
import { PostPage } from './pages/PostPage.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { UpdateProfilePage } from './pages/UpdateProfilePage.jsx';
import Header from './components/Header.jsx';
import CreatePost from './components/CreatePost.jsx';
import { useRecoilState, useRecoilValue } from 'recoil';
import userAtom from './atoms/userAtom.js';
import verifyAtom from './atoms/verifyAtom.js';
import ChatPage from './pages/ChatPage.jsx';
import FreezePage from './pages/FreezePage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import { useEffect } from 'react';

import VerifyResetCodePage from './pages/VerifyResetCodePage.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import Footer from './components/Footer.jsx';

function App() {
  const user = useRecoilValue(userAtom);
  const [verify, setVerify] = useRecoilState(verifyAtom);
  const { pathname } = useLocation();

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (!user) return;
      try {
        const response = await fetch('/api/users/isVerified');
        const data = await response.json();
        if (data.message === 'Email is verified') {
          setVerify(true);
        } else {
          setVerify(false);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setVerify(false);
      }
    };

    checkVerificationStatus();
  }, [user, setVerify]);
  return (
    <Box
      position='relative'
      display='flex'
      flexDirection='column'
      minH='100vh'
      w='full'
    >
      <Container
        flex='1'
        maxW={pathname === '/' ? { base: '620px', md: '900px' } : '620px'}
      >
        <Header />
        <Routes>
          <Route
            path='/'
            element={user && verify ? <HomePage /> : <Navigate to='/auth' />}
          />
          <Route
            path='/auth'
            element={!user ? <AuthPage /> : <Navigate to='/verify' />}
          />
          <Route
            path='/verify'
            element={
              user && verify === false ? (
                <VerifyEmailPage />
              ) : (
                <Navigate to='/' />
              )
            }
          />
          <Route
            path='/update'
            element={
              user && verify ? <UpdateProfilePage /> : <Navigate to='/auth' />
            }
          />
          <Route
            path='/:username'
            element={
              !user ? (
                <UserPage />
              ) : verify === false ? (
                <Navigate to='/auth' />
              ) : (
                <>
                  <UserPage />
                  <CreatePost />
                </>
              )
            }
          />
          <Route path='/:username/post/:pid' element={<PostPage />} />
          <Route
            path='/chat'
            element={user && verify ? <ChatPage /> : <Navigate to={'/auth'} />}
          />
          <Route
            path='/freeze'
            element={
              user && verify ? <FreezePage /> : <Navigate to={'/auth'} />
            }
          />
          <Route path='/verifyResetCode' element={<VerifyResetCodePage />} />
          <Route path='/resetPassword' element={<ResetPassword />} />
        </Routes>
      </Container>
      <Footer />
    </Box>
  );
}

export default App;
