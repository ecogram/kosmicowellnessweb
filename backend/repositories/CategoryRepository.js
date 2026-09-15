const BaseRepository = require('./BaseRepository');
const Category = require('../models/Category');

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findBySlug(slug) {
    return await this.model.findOne({ slug, isActive: true });
  }

  async findAllActive() {
    let list = await this.model.find({ isActive: { $ne: false } }).sort('sortOrder');
    if (!list || list.length === 0) {
      list = await this.model.find().sort('sortOrder');
    }
    return list;
  }
}

module.exports = new CategoryRepository();
