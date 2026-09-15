const BaseRepository = require('./BaseRepository');
const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async searchAndFilter(query = {}) {
    const {
      search,
      q,
      category,
      minPrice,
      maxPrice,
      sort,
      sortBy,
      minRating,
      rating,
      page,
      limit,
    } = query;

    const filter = { isActive: { $ne: false } };
    const andClauses = [];

    const searchTerm = search || q;
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim().length > 0) {
      const term = searchTerm.trim();
      andClauses.push({
        $or: [
          { name: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } },
          { shortDescription: { $regex: term, $options: 'i' } },
          { slug: { $regex: term, $options: 'i' } },
        ],
      });
    }

    if (category && category !== 'all' && category !== 'All') {
      let matchedCategoryIds = [];
      if (mongoose.isValidObjectId(category)) {
        matchedCategoryIds.push(category.toString());
      } else {
        const matchingCats = await Category.find({
          $or: [
            { slug: category },
            { name: { $regex: new RegExp(`^${category}$`, 'i') } },
            { name: { $regex: category, $options: 'i' } },
          ],
        });
        if (matchingCats && matchingCats.length > 0) {
          matchedCategoryIds = matchingCats.map((c) => c._id.toString());
        }
      }

      if (matchedCategoryIds.length > 0) {
        const objIds = matchedCategoryIds.map((id) => new mongoose.Types.ObjectId(id));
        const strIds = matchedCategoryIds.map((id) => id.toString());
        andClauses.push({
          $or: [
            { category: { $in: objIds } },
            { category: { $in: strIds } },
          ],
        });
      } else {
        andClauses.push({ category: new mongoose.Types.ObjectId() });
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceFilter = {};
      if (minPrice !== undefined && minPrice !== '') priceFilter.$gte = Number(minPrice);
      if (maxPrice !== undefined && maxPrice !== '') priceFilter.$lte = Number(maxPrice);
      if (Object.keys(priceFilter).length > 0) {
        andClauses.push({ price: priceFilter });
      }
    }

    const ratingThreshold = minRating !== undefined && minRating !== '' ? minRating : rating;
    if (ratingThreshold !== undefined && ratingThreshold !== '') {
      andClauses.push({
        $or: [
          { rating: { $gte: Number(ratingThreshold) } },
          { rating: { $exists: false } },
          { rating: null },
        ],
      });
    }

    if (andClauses.length > 0) {
      filter.$and = andClauses;
    }

    const sorting = sortBy || sort;
    let sortOption = { createdAt: -1 };
    if (sorting === 'price_low' || sorting === 'price_asc' || sorting === 'asc') {
      sortOption = { price: 1 };
    } else if (sorting === 'price_high' || sorting === 'price_desc' || sorting === 'desc') {
      sortOption = { price: -1 };
    } else if (sorting === 'rating' || sorting === 'rating_high' || sorting === 'top_rated') {
      sortOption = { rating: -1 };
    } else if (sorting === 'newest') {
      sortOption = { createdAt: -1 };
    }

    return await this.paginate(filter, { page, limit, sort: sortOption, populate: 'category' });
  }

  async findBySlug(slug) {
    return await this.model.findOne({ slug, isActive: true }).populate('category');
  }
}

module.exports = new ProductRepository();
