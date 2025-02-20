import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const protectRoute = async (req, res, next) => {
  try {
    let token;

    // extract token from cookies for web & from header for mobile
    if (req.platform === 'web') {
      token = req.cookies['jwt-token'];
    } else if (req.platform === 'mobile') {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // check if token exists
    if (!token) {
      return res
        .status(401)
        .json({ message: 'Unauthorized - No token provided' });
    }

    // verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // retrieve user data (no password)
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized - User not found' });
    }

    req.user = user;

    // proceed to the next function
    next();
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized - Invalid token' });
    console.error('Error in protectRoute:', err.message);
  }
};

export default protectRoute;
