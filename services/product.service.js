const { Op } = require('sequelize');
const Product = require('../models/postgres/Product.model');
const ApiError = require('../utils/ApiError');

/**
 * Create a new product.
 */
const createProduct = async (productData) => {
  const product = await Product.create(productData);
  return product;
};

/**
 * Get all products with search, filter, pagination, and sorting.
 */
const getAllProducts = async (queryParams) => {
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'DESC',
    search,
    category,
    minPrice,
    maxPrice,
    inStock,
  } = queryParams;

  const where = { isActive: true };

  // Search by name or category
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { category: { [Op.iLike]: `%${search}%` } },
    ];
  }

  // Filter by category
  if (category) {
    where.category = { [Op.iLike]: category };
  }

  // Filter by price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price[Op.gte] = parseFloat(minPrice);
    }
    if (maxPrice !== undefined) {
      where.price[Op.lte] = parseFloat(maxPrice);
    }
  }

  // Filter by stock status
  if (inStock !== undefined) {
    if (inStock === true || inStock === 'true') {
      where.stock = { [Op.gt]: 0 };
    } else {
      where.stock = { [Op.eq]: 0 };
    }
  }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const limitNum = parseInt(limit, 10);

  const { rows: products, count: total } = await Product.findAndCountAll({
    where,
    order: [[sort, order.toUpperCase()]],
    limit: limitNum,
    offset,
  });

  return {
    products,
    pagination: {
      page: parseInt(page, 10),
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a single product by ID.
 */
const getProductById = async (id) => {
  const product = await Product.findOne({
    where: { id, isActive: true },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  return product;
};

/**
 * Update a product by ID.
 */
const updateProduct = async (id, updateData) => {
  const product = await Product.findOne({
    where: { id, isActive: true },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await product.update(updateData);
  return product;
};

/**
 * Soft-delete a product (set isActive = false).
 */
const softDeleteProduct = async (id) => {
  const product = await Product.findOne({
    where: { id, isActive: true },
  });

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await product.update({ isActive: false });
  return product;
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  softDeleteProduct,
};
