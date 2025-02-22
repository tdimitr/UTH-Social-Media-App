import { useRecoilValue } from 'recoil';
import LoginCard from '../components/LoginCard';
import SignupCard from '../components/SignupCard';
import ForgotPasswordCard from '../components/ForgotPasswordCard';
import authScreenAtom from '../atoms/authAtom';

export const AuthPage = () => {
  const authScreenState = useRecoilValue(authScreenAtom);
  return (
    <>
      {' '}
      {authScreenState === 'login' && <LoginCard />}
      {authScreenState === 'signup' && <SignupCard />}
      {authScreenState === 'forgot-password' && <ForgotPasswordCard />}
    </>
  );
};
