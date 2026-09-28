const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const cartService = require('../services/cartService');

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  const cartObj = cart && typeof cart.toObject === 'function' ? cart.toObject() : cart;
  res.status(200).json(new ApiResponse(200, { cart: cartObj, ...cartObj }, 'Cart retrieved'));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, variant } = req.body;
  if (!productId || quantity == null) {
    throw new ApiError(400, 'Product ID and quantity are required');
  }
  const cart = await cartService.addToCart(req.user._id, productId, Number(quantity) || 1, variant);
  const cartObj = cart && typeof cart.toObject === 'function' ? cart.toObject() : cart;
  res.status(200).json(new ApiResponse(200, { cart: cartObj, ...cartObj }, 'Item added to cart'));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity, variant } = req.body;
  if (quantity == null) {
    throw new ApiError(400, 'Quantity is required');
  }
  const cart = await cartService.updateItemQuantity(req.user._id, req.params.productId, Number(quantity), variant);
  const cartObj = cart && typeof cart.toObject === 'function' ? cart.toObject() : cart;
  res.status(200).json(new ApiResponse(200, { cart: cartObj, ...cartObj }, 'Cart item updated'));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const variantSize = req.body?.variant || req.query?.variant;
  const cart = await cartService.removeCartItem(req.user._id, req.params.productId, variantSize);
  const cartObj = cart && typeof cart.toObject === 'function' ? cart.toObject() : cart;
  res.status(200).json(new ApiResponse(200, { cart: cartObj, ...cartObj }, 'Item removed from cart'));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user._id);
  const cartObj = cart && typeof cart.toObject === 'function' ? cart.toObject() : cart;
  res.status(200).json(new ApiResponse(200, { message: 'Cart cleared successfully', cart: cartObj, ...cartObj }, 'Cart cleared successfully'));
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};
