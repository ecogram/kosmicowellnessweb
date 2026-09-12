const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/apiResponse');
const wishlistService = require('../services/wishlistService');

const getUserId = (req) => req.user._id;

const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.getWishlist(getUserId(req));
  res.status(200).json(new ApiResponse(200, { wishlist }, 'Wishlist retrieved'));
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await wishlistService.addItem(getUserId(req), productId);
  res.status(200).json(new ApiResponse(200, { wishlist }, 'Item added to wishlist'));
});

const removeWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await wishlistService.removeItem(getUserId(req), productId);
  res.status(200).json(new ApiResponse(200, { wishlist }, 'Item removed from wishlist'));
});

const clearWishlist = asyncHandler(async (req, res) => {
  const wishlist = await wishlistService.clearWishlist(getUserId(req));
  res.status(200).json(new ApiResponse(200, { wishlist }, 'Wishlist cleared'));
});

const removeWishlistFromBody = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await wishlistService.removeItem(getUserId(req), productId);
  res.status(200).json(new ApiResponse(200, { wishlist }, 'Item removed from wishlist'));
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeWishlistItem,
  removeWishlistFromBody,
  clearWishlist,
};
