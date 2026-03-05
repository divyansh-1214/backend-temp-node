const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/mongo/User.model');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

// ── BlacklistedToken model (inline for token blacklist) ──────────────
const blacklistedTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);

const BlacklistedToken = mongoose.model('BlacklistedToken', blacklistedTokenSchema);

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Generate an access token for a user.
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
};

/**
 * Generate a refresh token for a user.
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );
};

/**
 * Parse a duration string (e.g. "15m", "7d") into milliseconds.
 */
const parseDuration = (duration) => {
  const units = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 900000; // default 15 minutes
  return parseInt(match[1], 10) * units[match[2]];
};

// ── Service Methods ─────────────────────────────────────────────────

/**
 * Register a new user.
 */
const register = async ({ name, email, password, role }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict('A user with this email already exists');
  }

  const user = await User.create({ name, email, password, role });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Store refresh token on user
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Login a user with email and password.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email, isDeleted: false }).select('+password +refreshToken');
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Update refresh token
  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken,
  };
};

/**
 * Refresh access and refresh tokens.
 */
const refreshTokens = async (oldRefreshToken) => {
  // Check if token is blacklisted
  const isBlacklisted = await BlacklistedToken.findOne({ token: oldRefreshToken });
  if (isBlacklisted) {
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, config.jwt.refreshSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Refresh token has expired. Please login again.');
    }
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.isDeleted) {
    throw ApiError.unauthorized('User not found');
  }

  if (user.refreshToken !== oldRefreshToken) {
    throw ApiError.unauthorized('Refresh token does not match. Please login again.');
  }

  // Blacklist the old refresh token
  const refreshExpMs = parseDuration(config.jwt.refreshExpiresIn);
  await BlacklistedToken.create({
    token: oldRefreshToken,
    expiresAt: new Date(Date.now() + refreshExpMs),
  });

  // Generate new tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken };
};

/**
 * Logout — blacklist the refresh token and clear it from the user.
 */
const logout = async (userId, refreshToken) => {
  if (refreshToken) {
    const refreshExpMs = parseDuration(config.jwt.refreshExpiresIn);
    await BlacklistedToken.create({
      token: refreshToken,
      expiresAt: new Date(Date.now() + refreshExpMs),
    });
  }

  await User.findByIdAndUpdate(userId, { refreshToken: null });
};

module.exports = {
  register,
  login,
  refreshTokens,
  logout,
};
