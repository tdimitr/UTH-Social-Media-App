import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail.js';

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: [isEmail, 'Please enter a valid email address.'],
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return v.length >= 6 && /[a-zA-Z]/.test(v);
        },
        message:
          'Password must be at least 6 characters long and contain at least one letter.',
      },
    },
    profilePic: {
      type: String,
      default: '',
    },
    followers: {
      type: [String],
      default: [],
    },
    following: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      default: '',
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    verificationCode: { type: String },
    verificationCodeExpiry: { type: Date },
    //verificationAttempts: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },

    resetPasswordCode: { type: String },
    resetPasswordCodeExpiry: { type: Date },
    //resetPasswordAttempts: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
