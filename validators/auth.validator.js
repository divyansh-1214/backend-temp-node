const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
    'any.required': 'Name is required',
  }),
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(128).required().messages({
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 6 characters',
    'string.max': 'Password must be at most 128 characters',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('user', 'admin', 'superadmin').default('user').messages({
    'any.only': 'Role must be one of: user, admin, superadmin',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().lowercase().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'string.empty': 'Refresh token is required',
    'any.required': 'Refresh token is required',
  }),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().messages({
    'string.empty': 'Old password is required',
    'any.required': 'Old password is required',
  }),
  newPassword: Joi.string().min(6).max(128).required().messages({
    'string.empty': 'New password is required',
    'string.min': 'New password must be at least 6 characters',
    'string.max': 'New password must be at most 128 characters',
    'any.required': 'New password is required',
  }),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name must be at most 100 characters',
  }),
  avatar: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Avatar must be a valid URL',
  }),
  preferences: Joi.object().default({}),
}).min(1).messages({
  'object.min': 'At least one field is required for update',
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  changePasswordSchema,
  updateProfileSchema,
};
