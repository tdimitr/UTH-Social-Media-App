import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/userModel.js';
import Post from '../models/postModel.js';
import generateToken from '../utils/generateToken.js';
import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import { generateVerificationCode } from '../utils/generateVerificationCode.js';

import sendResetPasswordEmail from '../utils/sendResetPassowrdEmail.js';
import { hashWithHMAC } from '../utils/hmac.js';

export const getUserProfile = async (req, res) => {
  // fetch user profile either with username or userId (query)
  const { query } = req.params;

  try {
    let user;
    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select('-password')
        .select('-updatedAt');
      // query is username
    } else {
      user = await User.findOne({ username: query })
        .select('-password')
        .select('-updatedAt');
    }

    if (!user) return res.status(404).json({ error: 'User Not Found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in getUserProfile:', err.message);
  }
};

export const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const platform = req.platform; // Use the platform set by middleware

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ error: 'Username already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Email verification setup
    const verificationCode = generateVerificationCode();
    const hashedVerificationCode = hashWithHMAC(verificationCode);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
      verificationCode: hashedVerificationCode,
      verificationCodeExpiry: Date.now() + 2 * 60 * 1000, // 2 minutes
      isVerified: false,
    });
    await newUser.save();

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    if (newUser) {
      const token = generateToken(newUser._id, res, platform);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        profilePic: newUser.profilePic,
        ...(platform === 'mobile' && { token }), // Include token only for mobile clients
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in signupUser:', err.message);
  }
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    // Check if the password is correct
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || '',
    );

    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Unfreeze the account if it was previously frozen
    if (user.isFrozen) {
      user.isFrozen = false;
      await user.save();
    }

    // Get platform from the middleware
    const platform = req.platform;

    // Generate the token and set cookie if platform is web
    const token = generateToken(user._id, res, platform);

    // Prepare the response data
    const responseData = {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePic: user.profilePic,
      ...(platform === 'mobile' && { token }), // Include token only for mobile clients
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log('Error in loginUser:', error.message);
  }
};

export const logoutUser = async (req, res) => {
  try {
    res.cookie('jwt-token', '', { maxAge: 1 });
    res.status(200).json({ message: 'You have been successfully logged out.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in logoutUser:', err.message);
  }
};

export const followUnFollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    // we take req.user._id on mongoDB(protectRoute.js), and its object.. so we convert it to string
    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ error: 'Cannot follow or unfollow yourself' });

    if (!userToModify || !currentUser)
      return res.status(400).json({ error: 'User not found' });

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: 'User unfollowed' });
    } else {
      // Follow user
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      res.status(200).json({ message: 'User followed' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in followUnfollowUser:', err.message);
  }
};

export const updateUser = async (req, res) => {
  const { name, email, username, password, bio } = req.body;
  let { profilePic } = req.body;

  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    // we take userId on mongoDB(protectRoute.js), and its object... so we convert it to string
    if (req.params.id !== userId.toString())
      return res.status(400).json({ error: 'You cannot update' });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePic) {
      if (user.profilePic) {
        await cloudinary.uploader.destroy(
          user.profilePic.split('/').pop().split('.')[0],
        );
      }

      const uploadedResponse = await cloudinary.uploader.upload(profilePic);
      profilePic = uploadedResponse.secure_url;
    }

    user.name = name || user.name; // if name is not provided(null), keep the existing name
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Find all posts that.. this user replied and update username and userProfilePic fields
    await Post.updateMany(
      { 'replies.userId': userId },
      {
        $set: {
          'replies.$[reply].username': user.username,
          'replies.$[reply].userProfilePic': user.profilePic,
        },
      },
      { arrayFilters: [{ 'reply.userId': userId }] },
    );

    // password should be null in response
    user.password = null;

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in updateUser:', err.message);
  }
};

export const updateMobileUser = async (req, res) => {
  const { name, email, username, password, bio, profilePic } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePic = profilePic || user.profilePic;
    user.bio = bio || user.bio;

    user = await user.save();

    // Update username and profilePic in all replies
    await Post.updateMany(
      { 'replies.userId': userId },
      {
        $set: {
          'replies.$[reply].username': user.username,
          'replies.$[reply].userProfilePic': user.profilePic,
        },
      },
      { arrayFilters: [{ 'reply.userId': userId }] },
    );

    user.password = null;
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.error('Error in updateMobileUser:', err.message);
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // exlude the current user from the suggested users and exclude users that current user is already following
    const userId = req.user._id;

    const usersFollowedByYou = await User.findById(userId).select('following');

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByYou.following.includes(user._id),
    );
    const suggestedUsers = filteredUsers.slice(0, 5);

    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in getSuggestedUsers:', err.message);
  }
};

export const freezeAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isFrozen = true;
    await user.save();

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log('Error in freezeAccount:', err.message);
  }
};

// For email verification
export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;

    if (user.isVerified) {
      return res.status(200).json({ message: 'Email already verified.' });
    }

    if (Date.now() > user.verificationCodeExpiry) {
      return res.status(400).json({ error: 'Verification code expired.' });
    }

    // Check if the provided code matches the stored hash
    const hashedInputCode = hashWithHMAC(code);
    if (hashedInputCode !== user.verificationCode) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Update verification status
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    res
      .status(200)
      .json({ isVerified: true, message: 'Email verified successfully' });
  } catch (err) {
    console.error('Error in verifyEmail:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

export const isVerified = async (req, res) => {
  try {
    const user = req.user;

    if (user.isVerified) {
      return res.status(200).json({ message: 'Email is verified' });
    } else {
      return res.status(400).json({ error: 'Email is not verified' });
    }
  } catch (err) {
    console.error('Error in isVerified:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

export const resendVerificationCode = async (req, res) => {
  try {
    const user = req.user;

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified.' });
    }

    // Generate and save a new code
    const newCode = generateVerificationCode();
    const hashedCode = hashWithHMAC(newCode);

    user.verificationCode = hashedCode;
    user.verificationCodeExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes
    await user.save();

    await sendVerificationEmail(user.email, newCode); // Use user’s email from DB

    res.status(200).json({ message: 'New verification code sent.' });
  } catch (err) {
    console.error('Error in resendVerificationCode:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

// For passowrd reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const resetCode = generateVerificationCode();
    const hashedResetCode = hashWithHMAC(resetCode);

    user.resetPasswordCode = hashedResetCode;
    user.resetPasswordCodeExpiry = Date.now() + 2 * 60 * 1000; // 2 minutes
    await user.save();

    // send reset password email
    await sendResetPasswordEmail(email, resetCode);

    res.status(200).json({
      message: 'Password reset code has been sent to your email.',
    });
  } catch (err) {
    console.error('Error in forgotPassword:', err);
    res.status(500).json({ error: err.message });
  }
};

export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (Date.now() > user.resetPasswordCodeExpiry) {
      return res.status(400).json({ error: 'Verification code expired.' });
    }

    // Check if the provided code matches the stored HMAC hash
    const hashedInputCode = hashWithHMAC(code);
    if (hashedInputCode !== user.resetPasswordCode) {
      return res.status(400).json({ error: 'Invalid reset password code.' });
    }

    res.status(200).json({ message: 'Reset code verified successfully.' });
  } catch (err) {
    console.error('Error in verifyResetCode:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, code } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Validate the reset code again for security
    const hashedInputCode = hashWithHMAC(code);
    if (hashedInputCode !== user.resetPasswordCode) {
      return res.status(400).json({ error: 'Invalid reset password code.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Error in resetPassword:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};

export const resendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Generate a new code
    const newResetCode = generateVerificationCode();
    const hashedCode = hashWithHMAC(newResetCode);

    // Save the new code and update expiration time
    user.resetPasswordCode = hashedCode;
    user.resetPasswordCodeExpiry = Date.now() + 2 * 60 * 1000; //2 minutes
    await user.save();

    await sendResetPasswordEmail(email, newResetCode);

    res.status(200).json({ message: 'New Reset Password Code sent.' });
  } catch (err) {
    console.error('Error in resendVerificationCode:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
};
