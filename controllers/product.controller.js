const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const productService = require('../services/product.service');

/**
 * GET /api/products
 * List all products with filters, search, pagination.
 */
const getAllProducts = asyncHandler(async (req, res) => {
  const { products, pagination } = await productService.getAllProducts(req.query);
  ApiResponse.success(res, 200, 'Products retrieved successfully', { products }, pagination);
});

/**
 * GET /api/products/:id
 * Get a single product by ID.
 */
const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  ApiResponse.success(res, 200, 'Product retrieved successfully', { product });
});

/**
 * POST /api/products
 * Create a new product (admin only).
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  ApiResponse.success(res, 201, 'Product created successfully', { product });
});

/**
 * PUT /api/products/:id
 * Update a product (admin only).
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  ApiResponse.success(res, 200, 'Product updated successfully', { product });
});

/**
 * DELETE /api/products/:id
 * Soft-delete a product (admin only).
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await productService.softDeleteProduct(req.params.id);
  ApiResponse.success(res, 200, 'Product deactivated successfully', { product });
});

module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
