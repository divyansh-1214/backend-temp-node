const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/auth.service');

/**
 * POST /api/auth/register
 * Register a new user.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });

  ApiResponse.success(res, 201, 'User registered successfully', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

/**
 * POST /api/auth/login
 * Login with email and password.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  ApiResponse.success(res, 200, 'Login successful', {
    user: result.user,
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
  });
});

/**
 * POST /api/auth/refresh
 * Refresh access and refresh tokens.
 */
const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);

  ApiResponse.success(res, 200, 'Tokens refreshed successfully', tokens);
});

/**
 * POST /api/auth/logout
 * Logout and blacklist the refresh token.
 */
const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  await authService.logout(req.user._id, refreshToken);

  ApiResponse.success(res, 200, 'Logged out successfully');
});

module.exports = {
  register,
  login,
  refresh,
  logout,
};
