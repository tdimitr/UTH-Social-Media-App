import jwt from 'jsonwebtoken';

const generateToken = (userId, res, platform) => {
  // generate token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  // save token as cookies for web
  if (platform === 'web') {
    res.cookie('jwt-token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });
  }

  return token;
};
export default generateToken;
