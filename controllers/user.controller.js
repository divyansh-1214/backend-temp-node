const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const userService = require('../services/user.service');

/**
 * GET /api/users/me
 * Get the authenticated user's profile.
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);
  ApiResponse.success(res, 200, 'Profile retrieved successfully', { user });
});

/**
 * PUT /api/users/me
 * Update the authenticated user's profile.
 */
const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  ApiResponse.success(res, 200, 'Profile updated successfully', { user });
});

/**
 * PUT /api/users/me/password
 * Change the authenticated user's password.
 */
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await userService.changePassword(req.user._id, oldPassword, newPassword);
  ApiResponse.success(res, 200, result.message);
});

/**
 * GET /api/users
 * List all users with pagination and filters (admin only).
 */
const listUsers = asyncHandler(async (req, res) => {
  const { users, pagination } = await userService.listUsers(req.query);
  ApiResponse.success(res, 200, 'Users retrieved successfully', { users }, pagination);
});

/**
 * DELETE /api/users/:id
 * Soft-delete a user (admin only).
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await userService.softDeleteUser(req.params.id);
  ApiResponse.success(res, 200, 'User deactivated successfully', { user });
});

module.exports = {
  getMe,
  updateMe,
  changePassword,
  listUsers,
  deleteUser,
};
