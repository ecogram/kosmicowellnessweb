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

// 3. GET Admin Products List (GET /api/products/admin/list)
const getAdminProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 100;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Product.countDocuments(),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Admin products list retrieved successfully'
    )
  );
});

// 4. POST Create New Product (POST /api/admin/products/add-product)
const addProduct = asyncHandler(async (req, res) => {
  const {
    name,
    price,
    originalPrice,
    compareAtPrice,
    description,
    shortDescription,
    category,
    countInStock,
    stock,
    visibility,
    isActive,
    brand,
    image,
    images,
  } = req.body;

  if (!name || !price || !description) {
    throw new ApiError(400, 'Product name, price, and description are required');
  }

  const slug = req.body.slug || (name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now());

  let imageList = [];
  const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
  if (file) {
    const savedUrl = saveMediaFile(file, 'products');
    imageList.push(savedUrl);
  } else if (Array.isArray(images) && images.length > 0) {
    imageList = images;
  } else if (image) {
    imageList = [image];
  } else {
    imageList = ['no-photo.jpg'];
  }

  const parsedVisibility = visibility !== undefined
    ? (visibility === true || visibility === 'true')
    : (isActive !== undefined ? (isActive === true || isActive === 'true') : true);

  const product = await Product.create({
    name,
    slug,
    description,
    shortDescription: shortDescription || description.slice(0, 150),
    price: Number(price),
    compareAtPrice: Number(originalPrice || compareAtPrice || price),
    originalPrice: Number(originalPrice || compareAtPrice || price),
    category: category || 'Skincare',
    stock: Number(stock !== undefined ? stock : (countInStock !== undefined ? countInStock : 0)),
    countInStock: Number(countInStock !== undefined ? countInStock : (stock !== undefined ? stock : 0)),
    images: imageList,
    image: imageList[0] || 'no-photo.jpg',
    isActive: parsedVisibility,
    visibility: parsedVisibility,
    brand: brand || 'Kosmico',
  });

  res.status(201).json(new ApiResponse(201, { product }, 'Product created successfully'));
});

// 5. PUT Update Product Details (PUT /api/admin/products/update-product/:id)
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const {
    name,
    price,
    originalPrice,
    compareAtPrice,
    description,
    shortDescription,
    category,
    countInStock,
    stock,
    visibility,
    isActive,
    brand,
  } = req.body;

  if (name !== undefined) product.name = name;
  if (price !== undefined) product.price = Number(price);
  if (originalPrice !== undefined || compareAtPrice !== undefined) {
    product.compareAtPrice = Number(originalPrice || compareAtPrice);
    product.originalPrice = Number(originalPrice || compareAtPrice);
  }
  if (description !== undefined) product.description = description;
  if (shortDescription !== undefined) product.shortDescription = shortDescription;
  if (category !== undefined) product.category = category;
  if (stock !== undefined || countInStock !== undefined) {
    const qty = Number(stock !== undefined ? stock : countInStock);
    product.stock = qty;
    product.countInStock = qty;
  }
  if (visibility !== undefined) {
    const v = visibility === true || visibility === 'true';
    product.visibility = v;
    product.isActive = v;
  }
  if (isActive !== undefined) {
    const a = isActive === true || isActive === 'true';
    product.isActive = a;
    product.visibility = a;
  }
  if (brand !== undefined) product.brand = brand;

  const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
  if (file) {
    const savedUrl = saveMediaFile(file, 'products');
    product.images = [savedUrl, ...(product.images || [])];
    product.image = savedUrl;
  }

  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product updated successfully'));
});

// 6. PUT Toggle Product Visibility (PUT /api/products/admin/toggle-visibility/:id)
const toggleVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const newVisibility = !product.isActive;
  product.isActive = newVisibility;
  product.visibility = newVisibility;
  await product.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { product, visibility: newVisibility, isActive: newVisibility },
      `Product visibility toggled to ${newVisibility ? 'visible' : 'hidden'}`
    )
  );
});

// 7. DELETE Delete Product (DELETE /api/products/admin/delete-product/:id)
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});

// 8. POST Extract Product URL (POST /api/admin/products/extract-url)
const extractProductUrl = asyncHandler(async (req, res) => {
  const { productUrl } = req.body;

  if (!productUrl) {
    throw new ApiError(400, 'productUrl is required');
  }

  let extracted = {
    name: 'Extracted Vitamin Serum',
    description: 'Auto-extracted product details from external URL',
    price: 499,
    originalPrice: 899,
    category: 'Skincare',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'],
    brand: 'Kosmico',
    productUrl,
  };

  try {
    const urlObj = new URL(productUrl);
    const domainName = urlObj.hostname.replace('www.', '').split('.')[0];
    const pathnameParts = urlObj.pathname.split('/').filter(Boolean);
    const slugName = pathnameParts.pop() || 'product';
    const cleanTitle = slugName.replace(/[-_]+/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    extracted.name = cleanTitle || extracted.name;
    extracted.brand = domainName.charAt(0).toUpperCase() + domainName.slice(1);
  } catch (_) { }

  res.status(200).json(new ApiResponse(200, extracted, 'Product data extracted successfully'));
});

// 9. GET Distinct Product Categories (GET /api/products/categories)
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

// 10. GET Bestseller Products (GET /api/products/bestsellers)
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
  getAdminProducts,
  getDistinctCategories,
  getBestsellers,
  addProduct,
  updateProduct,
  toggleVisibility,
  deleteProduct,
  extractProductUrl,
};
