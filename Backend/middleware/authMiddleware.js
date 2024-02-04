const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistToken = require('../models/BlacklistToken');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization');

    if (!token) {
      throw new Error('No token provided');
    }

    if (!token.startsWith('Bearer ')) {
      throw new Error('Invalid token format');
    }

    // Remove 'Bearer ' from the token
    const tokenValue = token.replace('Bearer ', '');

    // Check if the token is blacklisted
    const isTokenBlacklisted = await BlacklistToken.exists({ token: tokenValue });

    if (isTokenBlacklisted) {
      throw new Error('Token is blacklisted');
    }

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Find the user using only the _id field
    const user = await User.findOne({ _id: decoded.userId });

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    req.token = tokenValue;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).send({ error: `Please authenticate. Error: ${error.message}` });
  }
};

module.exports = authMiddleware;
