const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware:
 * Protects routes by verifying the JSON Web Token (JWT) sent in the Authorization header.
 * Attaches the authenticated user object to `req.user`.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Bearer token is provided in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token with secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from token payload and exclude password
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User belonging to this token no longer exists',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No token provided',
    });
  }
};

module.exports = { protect };
