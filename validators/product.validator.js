const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).required().messages({
    'string.empty': 'Product name is required',
    'string.max': 'Product name must be at most 255 characters',
    'any.required': 'Product name is required',
  }),
  description: Joi.string().trim().allow(null, '').messages({
    'string.base': 'Description must be a string',
  }),
  price: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be a positive number',
    'any.required': 'Price is required',
  }),
  stock: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'Stock must be a number',
    'number.integer': 'Stock must be an integer',
    'number.min': 'Stock cannot be negative',
  }),
  category: Joi.string().trim().max(100).allow(null, '').messages({
    'string.max': 'Category must be at most 100 characters',
  }),
  imageUrl: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Image URL must be a valid URL',
  }),
  isActive: Joi.boolean().default(true),
});

const updateProductSchema = Joi.object({
  name: Joi.string().trim().min(1).max(255).messages({
    'string.empty': 'Product name cannot be empty',
    'string.max': 'Product name must be at most 255 characters',
  }),
  description: Joi.string().trim().allow(null, '').messages({
    'string.base': 'Description must be a string',
  }),
  price: Joi.number().precision(2).min(0).messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be a positive number',
  }),
  stock: Joi.number().integer().min(0).messages({
    'number.base': 'Stock must be a number',
    'number.integer': 'Stock must be an integer',
    'number.min': 'Stock cannot be negative',
  }),
  category: Joi.string().trim().max(100).allow(null, '').messages({
    'string.max': 'Category must be at most 100 characters',
  }),
  imageUrl: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'Image URL must be a valid URL',
  }),
  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'At least one field is required for update',
});

const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.min': 'Page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must be at most 100',
  }),
  sort: Joi.string()
    .valid('name', 'price', 'stock', 'category', 'createdAt', 'updatedAt')
    .default('createdAt')
    .messages({
      'any.only': 'Sort must be one of: name, price, stock, category, createdAt, updatedAt',
    }),
  order: Joi.string().valid('ASC', 'DESC', 'asc', 'desc').default('DESC').messages({
    'any.only': 'Order must be ASC or DESC',
  }),
  search: Joi.string().trim().allow('').max(255),
  category: Joi.string().trim().max(100),
  minPrice: Joi.number().min(0).messages({
    'number.min': 'Minimum price must be a positive number',
  }),
  maxPrice: Joi.number().min(0).messages({
    'number.min': 'Maximum price must be a positive number',
  }),
  inStock: Joi.boolean(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
};
