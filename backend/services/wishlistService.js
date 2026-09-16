const mongoose = require('mongoose');
const wishlistRepository = require('../repositories/WishlistRepository');
const Product = require('../models/Product');
const { ApiError } = require('../utils/apiResponse');

class WishlistService {
  async getWishlist(userId) {
    let wishlist = await wishlistRepository.findOneWithProducts({ user: userId });
    if (!wishlist) {
      wishlist = await wishlistRepository.create({ user: userId, items: [] });
    }
    return wishlist;
  }

  async addItem(userId, productId) {
    let product = null;
    if (mongoose.isValidObjectId(productId)) {
      product = await Product.findById(productId);
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ slug: productId }, { name: new RegExp(productId, 'i') }] });
    }

    const realProductId = product ? product._id : productId;

    let wishlist = await wishlistRepository.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await wishlistRepository.create({ user: userId, items: [] });
    }

    // Add if not exists
    const exists = wishlist.items.some(item => (item._id || item).toString() === realProductId.toString());
    if (!exists) {
      wishlist.items.push(realProductId);
      await wishlist.save();
    }
    
    // Emit socket event for instant real-time sync with Web/App
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('wishlist:updated', { userId });
      }
    } catch (_) {}

    // Return populated list
    return await wishlistRepository.findOneWithProducts({ user: userId });
  }

  async removeItem(userId, productId) {
    let wishlist = await wishlistRepository.findOne({ user: userId });
    if (!wishlist) {
      return { user: userId, items: [] };
    }

    wishlist.items = wishlist.items.filter(item => {
      const idStr = (item._id || item).toString();
      return idStr !== productId.toString();
    });
    await wishlist.save();
    
    // Emit socket event for instant real-time sync with Web/App
    try {
      const { getIO } = require('../config/socket');
      const io = getIO();
      if (io) {
        io.to(`user:${userId}`).emit('wishlist:updated', { userId });
      }
    } catch (_) {}

    return await wishlistRepository.findOneWithProducts({ user: userId });
  }

  async clearWishlist(userId) {
    let wishlist = await wishlistRepository.findOne({ user: userId });
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }
    return await wishlistRepository.findOneWithProducts({ user: userId });
  }
}

module.exports = new WishlistService();
