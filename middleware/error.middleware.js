const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const config = require('../config/env');

/**
 * Global error handler middleware.
 * Catches all errors thrown in the application and returns a standardized response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', err);
  }

  // Handle known ApiError instances
  if (error instanceof ApiError) {
    return ApiResponse.error(res, error.statusCode, error.message, error.errors);
  }

  // Mongoose validation error
  if (error.name === 'ValidationError' && error.errors) {
    const errors = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.error(res, 400, 'Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return ApiResponse.error(res, 409, `Duplicate value for field: ${field}`, [
      { field, message: `${field} already exists` },
    ]);
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return ApiResponse.error(res, 400, `Invalid ${error.path}: ${error.value}`);
  }

  // Sequelize validation error
  if (error.name === 'SequelizeValidationError') {
    const errors = error.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return ApiResponse.error(res, 400, 'Validation failed', errors);
  }

  // Sequelize unique constraint error
  if (error.name === 'SequelizeUniqueConstraintError') {
    const errors = error.errors.map((e) => ({
      field: e.path,
      message: `${e.path} already exists`,
    }));
    return ApiResponse.error(res, 409, 'Duplicate entry', errors);
  }

  // Sequelize database error
  if (error.name === 'SequelizeDatabaseError') {
    return ApiResponse.error(res, 500, 'Database error occurred');
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 401, 'Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 401, 'Token has expired');
  }

  // Default: unknown / unexpected error
  const statusCode = error.statusCode || 500;
  const message =
    config.nodeEnv === 'production'
      ? 'An unexpected error occurred'
      : error.message || 'An unexpected error occurred';

  return ApiResponse.error(res, statusCode, message);
};

module.exports = errorHandler;
