import express from 'express';
import {
  followUnFollowUser,
  getUserProfile,
  loginUser,
  logoutUser,
  signupUser,
  updateUser,
  updateMobileUser,
  getSuggestedUsers,
  freezeAccount,
  verifyEmail,
  isVerified,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendVerificationCode,
  resendResetPasswordCode,
} from '../controllers/userController.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// METHODS
router.get('/profile/:query', getUserProfile);
router.get('/suggested', protectRoute, getSuggestedUsers);

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/follow/:id', protectRoute, followUnFollowUser);

router.put('/update/:id', protectRoute, updateUser);
router.put('/mobile/update/:id', protectRoute, updateMobileUser);
router.put('/freeze', protectRoute, freezeAccount);

// VERIFICATION
router.post('/verify-email', protectRoute, verifyEmail);
router.get('/isVerified', protectRoute, isVerified);
router.get('/resendVerificationCode', protectRoute, resendVerificationCode);

router.post('/forgot-password', forgotPassword); // Generate 1st token
router.post('/verifyResetCode', verifyResetCode); // use 1st token also verify the code & generate 2nd token
router.post('/resendResetPasswordCode', resendResetPasswordCode); // use 1st token (GET)
router.post('/resetPassword', resetPassword); // use 2nd token and change password

export default router;
