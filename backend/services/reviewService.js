const mongoose = require('mongoose');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { ApiError } = require('../utils/apiResponse');

class ReviewService {
  async checkVerifiedPurchase(userId, productId) {
    // Check if user has an order containing this product that is DELIVERED or COMPLETED.
    // For now, any non-cancelled order is acceptable, but let's strictly look for delivered/paid.
    // Assuming 'DELIVERED' is a valid status. If Phase 9 uses 'PROCESSING'/'DELIVERED', we'll check it.
    const eligibleOrder = await Order.findOne({
      user: userId,
      'items.product': productId,
      orderStatus: { $nin: ['CANCELLED'] }, // At least not cancelled
    });

    return !!eligibleOrder;
  }

  async createReview(productId, userId, rating, title, content) {
    let product = null;
    if (mongoose.isValidObjectId(productId)) {
      product = await Product.findById(productId);
    }
    if (!product) {
      product = await Product.findOne({ slug: productId });
    }
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const realProductId = product._id;
    const isVerifiedPurchase = await this.checkVerifiedPurchase(userId, realProductId);

    try {
      const review = await Review.create({
        product: realProductId,
        user: userId,
        rating,
        title,
        content,
        isVerifiedPurchase,
        isApproved: true,
      });
      
      const { emitToAdmins, emitToUser } = require('../realtime/emitter');
      emitToAdmins('admin:new-review', { reviewId: review._id, product: productId });
      emitToUser(userId, 'review:new', { reviewId: review._id, product: productId });
      
      return review;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, 'You have already reviewed this product.');
      }
      throw error;
    }
  }

  async updateReview(reviewId, userId, data) {
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      throw new ApiError(404, 'Review not found or unauthorized');
    }

    if (data.rating) review.rating = data.rating;
    if (data.title) review.title = data.title;
    if (data.content) review.content = data.content;

    await review.save();
    return review;
  }

  async deleteReview(reviewId, userId) {
    const review = await Review.findOneAndDelete({ _id: reviewId, user: userId });
    if (!review) {
      throw new ApiError(404, 'Review not found or unauthorized');
    }
    return review;
  }

  async getProductReviews(productId, query = {}) {
    const { page = 1, limit = 10, sort = 'newest' } = query;
    const skip = (page - 1) * limit;

    let sortObj = { createdAt: -1 };
    if (sort === 'oldest') sortObj = { createdAt: 1 };
    if (sort === 'highest') sortObj = { rating: -1, createdAt: -1 };
    if (sort === 'lowest') sortObj = { rating: 1, createdAt: -1 };
    if (sort === 'helpful') sortObj = { helpfulCount: -1, createdAt: -1 };

    const filter = { isApproved: true };
    if (productId) {
      filter.product = productId;
    }

    const reviews = await Review.find(filter)
      .populate('user', 'name')
      .populate('product', 'name slug')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    return {
      reviews,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getProductRatingStats(productId) {
    const stats = await Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
      {
        $group: {
          _id: '$product',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          star5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          star4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          star3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          star2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          star1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        },
      },
    ]);

    if (stats.length === 0) {
      return { averageRating: 0, totalReviews: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
    }

    return {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // 1 decimal place
      totalReviews: stats[0].totalReviews,
      distribution: {
        5: stats[0].star5,
        4: stats[0].star4,
        3: stats[0].star3,
        2: stats[0].star2,
        1: stats[0].star1,
      },
    };
  }

  async toggleHelpful(reviewId, userId) {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }

    const hasVoted = review.helpfulVotes.includes(userId);
    if (hasVoted) {
      // Remove vote
      review.helpfulVotes.pull(userId);
    } else {
      // Add vote
      review.helpfulVotes.push(userId);
    }

    review.helpfulCount = review.helpfulVotes.length;
    await review.save();

    return review;
  }
}

module.exports = new ReviewService();
