const jwt = require('jsonwebtoken');
const User = require('../models/mongo/User.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

/**
 * Middleware to authenticate a user via JWT access token.
 * Extracts token from Authorization header (Bearer <token>).
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Access denied. No token provided.');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      throw ApiError.unauthorized('User not found. Token may be invalid.');
    }

    if (user.isDeleted) {
      throw ApiError.unauthorized('Account has been deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Token has expired. Please refresh your token.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid token.');
    }
    throw ApiError.unauthorized('Authentication failed.');
  }
});

/**
 * Middleware factory to authorize specific roles.
 * Must be used AFTER authenticate middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'superadmin')
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = { authenticate, authorize };
