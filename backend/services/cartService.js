const cartRepository = require('../repositories/CartRepository');
const Product = require('../models/Product');
const { ApiError } = require('../utils/apiResponse');

class CartService {
  async getCart(userId) {
    let cart = await cartRepository.model.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await cartRepository.create({ user: userId, items: [] });
      cart = await cartRepository.model.findById(cart._id).populate('items.product');
    }

    // Auto-purge any orphaned/deleted product items from cart
    if (cart && cart.items && cart.items.length > 0) {
      const initialCount = cart.items.length;
      cart.items = cart.items.filter(item => item.product !== null && item.product !== undefined);
      if (cart.items.length !== initialCount) {
        await cart.save();
      }
    }

    return cart;
  }

  async addToCart(userId, productId, quantity, variantSize) {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, 'Product not found');
    
    let price = product.price;
    let stock = product.stock;
    if (variantSize && product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.size === variantSize);
      if (variant) {
        price = variant.price;
        stock = variant.stock;
      }
    }
    
    if (stock < quantity) throw new ApiError(400, 'Not enough stock');

    let cart = await cartRepository.findOne({ user: userId });
    if (!cart) {
      cart = await cartRepository.create({ user: userId, items: [] });
    }

    // Safely filter out null products
    cart.items = cart.items.filter(item => item.product !== null && item.product !== undefined);

    const itemIndex = cart.items.findIndex(item => {
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      return pId === productId && item.variant === variantSize;
    });

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].priceSnapshot = price; // Update price
    } else {
      cart.items.push({
        product: productId,
        quantity,
        variant: variantSize,
        priceSnapshot: price,
      });
    }

    await cart.save();
    return await cartRepository.model.findById(cart._id).populate('items.product');
  }

  async updateItemQuantity(userId, productId, quantity, variantSize) {
    let cart = await cartRepository.findOne({ user: userId });
    if (!cart) throw new ApiError(404, 'Cart not found');

    cart.items = cart.items.filter(item => item.product !== null && item.product !== undefined);

    const itemIndex = cart.items.findIndex(item => {
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      return pId === productId && (item.variant === variantSize || (!item.variant && !variantSize));
    });

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
    } else {
      throw new ApiError(404, 'Item not found in cart');
    }
    return await cartRepository.model.findById(cart._id).populate('items.product');
  }

  async removeCartItem(userId, productId, variantSize) {
    let cart = await cartRepository.findOne({ user: userId });
    if (!cart) throw new ApiError(404, 'Cart not found');

    cart.items = cart.items.filter(item => {
      if (!item.product) return false; // Purge null products automatically
      const pId = item.product._id ? item.product._id.toString() : item.product.toString();
      const isProductMatch = pId === productId;
      const isVariantMatch = !variantSize || item.variant === variantSize;
      return !(isProductMatch && isVariantMatch);
    });

    await cart.save();
    return await cartRepository.model.findById(cart._id).populate('items.product');
  }

  async clearCart(userId) {
    let cart = await cartRepository.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return await cartRepository.model.findById(cart._id).populate('items.product');
  }
}

module.exports = new CartService();

