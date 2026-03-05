const morgan = require('morgan');
const config = require('../config/env');

/**
 * HTTP request logger middleware using Morgan.
 * Uses 'dev' format in development for concise colored output.
 * Uses 'combined' format in production for full Apache-style logs.
 */
const logger = morgan(config.nodeEnv === 'development' ? 'dev' : 'combined');

module.exports = logger;
