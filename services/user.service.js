const User = require('../models/mongo/User.model');
const ApiError = require('../utils/ApiError');

/**
 * Get the authenticated user's profile.
 */
const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.isDeleted) {
    throw ApiError.notFound('User not found');
  }
  return user;
};

/**
 * Update the authenticated user's profile.
 */
const updateProfile = async (userId, updateData) => {
  const allowedFields = ['name', 'avatar', 'preferences'];
  const updates = {};

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  }

  const user = await User.findByIdAndUpdate(userId, updates, {
    new: true,
    runValidators: true,
  });

  if (!user || user.isDeleted) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

/**
 * Change the authenticated user's password (requires old password verification).
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user || user.isDeleted) {
    throw ApiError.notFound('User not found');
  }

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save(); // triggers pre-save hook to hash

  return { message: 'Password changed successfully' };
};

/**
 * List all users with pagination and filters (admin only).
 */
const listUsers = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    search,
    role,
    isDeleted,
  } = queryParams;

  const filter = {};

  // By default, hide soft-deleted users
  if (isDeleted !== undefined) {
    filter.isDeleted = isDeleted === 'true';
  } else {
    filter.isDeleted = false;
  }

  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const limitNum = parseInt(limit, 10);

  const [users, total] = await Promise.all([
    User.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page: parseInt(page, 10),
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Soft-delete a user by setting isDeleted = true (admin only).
 */
const softDeleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (user.isDeleted) {
    throw ApiError.badRequest('User is already deactivated');
  }

  user.isDeleted = true;
  user.deletedAt = new Date();
  user.refreshToken = null;
  await user.save();

  return user;
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  listUsers,
  softDeleteUser,
};
