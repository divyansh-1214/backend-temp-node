const swaggerJsdoc = require('swagger-jsdoc');
const config = require('./env');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MERN Dual-DB Backend API',
    version: '1.0.0',
    description:
      'Production-ready MERN backend with MongoDB + PostgreSQL dual-database architecture. Provides authentication, user management, and product CRUD endpoints.',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
    },
    schemas: {
      // ── Reusable response wrapper ─────────────────────────────────
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
          data: { type: 'object', nullable: true },
          errors: { type: 'object', nullable: true },
        },
      },

      // ── Auth schemas ──────────────────────────────────────────────
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', minLength: 6, maxLength: 128, example: 'secret123' },
          role: { type: 'string', enum: ['user', 'admin', 'superadmin'], default: 'user' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'secret123' },
        },
      },
      RefreshRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
          errors: { type: 'object', nullable: true },
        },
      },

      // ── User schemas ──────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          role: { type: 'string', enum: ['user', 'admin', 'superadmin'] },
          avatar: { type: 'string', format: 'uri', nullable: true },
          preferences: { type: 'object' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UpdateProfileRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Jane Doe' },
          avatar: { type: 'string', format: 'uri', nullable: true, example: 'https://example.com/avatar.jpg' },
          preferences: { type: 'object' },
        },
      },
      ChangePasswordRequest: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', example: 'oldSecret123' },
          newPassword: { type: 'string', minLength: 6, maxLength: 128, example: 'newSecret456' },
        },
      },

      // ── Product schemas ───────────────────────────────────────────
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Wireless Headphones' },
          description: { type: 'string', nullable: true },
          price: { type: 'number', format: 'float', example: 49.99 },
          stock: { type: 'integer', example: 100 },
          category: { type: 'string', nullable: true, example: 'Electronics' },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateProductRequest: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', maxLength: 255, example: 'Wireless Headphones' },
          description: { type: 'string', nullable: true, example: 'Noise-cancelling over-ear headphones' },
          price: { type: 'number', format: 'float', minimum: 0, example: 49.99 },
          stock: { type: 'integer', minimum: 0, default: 0, example: 100 },
          category: { type: 'string', maxLength: 100, nullable: true, example: 'Electronics' },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
          isActive: { type: 'boolean', default: true },
        },
      },
      UpdateProductRequest: {
        type: 'object',
        minProperties: 1,
        properties: {
          name: { type: 'string', maxLength: 255 },
          description: { type: 'string', nullable: true },
          price: { type: 'number', format: 'float', minimum: 0 },
          stock: { type: 'integer', minimum: 0 },
          category: { type: 'string', maxLength: 100, nullable: true },
          imageUrl: { type: 'string', format: 'uri', nullable: true },
          isActive: { type: 'boolean' },
        },
      },

      // ── Pagination ────────────────────────────────────────────────
      Pagination: {
        type: 'object',
        properties: {
          currentPage: { type: 'integer', example: 1 },
          totalPages: { type: 'integer', example: 5 },
          totalItems: { type: 'integer', example: 50 },
          limit: { type: 'integer', example: 10 },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management endpoints' },
    { name: 'Products', description: 'Product CRUD endpoints' },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
