const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const productService = require('../services/productService');
const Product = require('../models/Product');
const { saveMediaFile } = require('../utils/profileStorage');

// 1. GET User Products List (GET /api/products/user/list)
const getProducts = asyncHandler(async (req, res) => {
  const result = await productService.getAllProducts(req.query);
  const response = new ApiResponse(200, result.data, 'Products fetched successfully');
  response.meta = result.meta;
  res.status(200).json(response);
});

// 2. GET Single Product by Slug or ID (GET /api/products/:slug)
const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  let product = null;

  if (slug.match(/^[0-9a-fA-F]{24}$/)) {
    product = await Product.findById(slug).lean();
  }
  if (!product) {
    product = await productService.getProductBySlug(slug);
  }

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(new ApiResponse(200, { product }, 'Product fetched successfully'));
});

// 3. GET Distinct Product Categories (GET /api/products/categories)
const getDistinctCategories = asyncHandler(async (req, res) => {
  const Category = require('../models/Category');

  const [categoriesFromDb, distinctCats] = await Promise.all([
    Category.find({ isActive: true }).select('name slug image description').lean().catch(() => []),
    Product.distinct('category'),
  ]);

  const categoryNames = Array.from(new Set([
    ...categoriesFromDb.map(c => c.name),
    ...distinctCats.map(c => typeof c === 'object' ? (c.name || '') : String(c)).filter(Boolean),
    'Skincare', 'Haircare', 'Wellness', 'Ayurveda', 'Personal Care'
  ])).filter(Boolean);

  res.status(200).json(new ApiResponse(200, categoryNames, 'Distinct categories retrieved'));
});

// 4. GET Bestseller Products (GET /api/products/bestsellers)
const getBestsellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ rating: -1, reviewsCount: -1, createdAt: -1 })
    .limit(8)
    .lean();

  res.status(200).json(new ApiResponse(200, { products }, 'Bestseller products fetched successfully'));
});

module.exports = {
  getProducts,
  getProductBySlug,
  getDistinctCategories,
  getBestsellers,
};
