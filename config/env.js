const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '.env.example') });

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // MongoDB
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/your_db',

  // PostgreSQL
  pg: {
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT, 10) || 5432,
    database: process.env.PG_DATABASE || 'E-com-temp',
    user: process.env.PG_USER || 'divvv',
    password: process.env.PG_PASSWORD || 'div',
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // CORS
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
};
