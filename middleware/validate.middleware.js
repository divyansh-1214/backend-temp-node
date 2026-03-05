const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory.
 * Takes a Joi schema and the request property to validate (body, params, query).
 *
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @param {'body'|'params'|'query'} property - Request property to validate
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      throw new ApiError(400, 'Validation failed', errors);
    }

    // Replace with validated & sanitized values
    req[property] = value;
    next();
  };
};

module.exports = validate;
