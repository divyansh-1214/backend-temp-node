/**
 * Async handler wrapper.
 * Wraps async route handlers to catch errors and forward them to Express error middleware.
 * Eliminates the need for repetitive try/catch blocks in every controller.
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
