const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be non-negative'],
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare price must be non-negative'],
    },
    images: {
      type: [String],
      default: ['no-photo.jpg'],
    },
    category: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'Category',
      required: true,
    },
    sku: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        compareAtPrice: { type: Number },
        stock: { type: Number, default: 0 },
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    benefits: [String],
    ingredients: [String],
    usage: String,
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for search and filtering
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
