const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: false,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
      required: false,
      index: true,
    },
    type: {
      type: String,
      default: 'GENERAL',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed, // e.g., { orderId, orderNumber }
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index to query user's notifications efficiently
notificationSchema.index({ user: 1, createdAt: -1 });

// Deduplication index (sparse) - prevents the same notification type for the same order from repeating
// Only index data.orderId if it exists
notificationSchema.index(
  { user: 1, type: 1, 'data.orderId': 1 }, 
  { unique: true, partialFilterExpression: { 'data.orderId': { $exists: true } } }
);

module.exports = mongoose.model('Notification', notificationSchema);
