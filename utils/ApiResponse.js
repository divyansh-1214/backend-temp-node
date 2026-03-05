/**
 * Standardized API Response helper.
 * Ensures all API responses follow a consistent shape.
 */
class ApiResponse {
  /**
   * Send a success response.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {*} data
   * @param {object|null} pagination
   */
  static success(res, statusCode, message, data = null, pagination = null) {
    const response = {
      success: true,
      message,
      data,
      errors: null,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    return res.status(statusCode).json(response);
  }

  /**
   * Send an error response.
   * @param {import('express').Response} res
   * @param {number} statusCode
   * @param {string} message
   * @param {Array} errors
   */
  static error(res, statusCode, message, errors = []) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors: errors.length > 0 ? errors : null,
    });
  }
}

module.exports = ApiResponse;
