const mongoose = require('mongoose');

const draftOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    orderPayload: {
      type: Object,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Automatically remove uncompleted drafts after 24 hours (TTL)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DraftOrder', draftOrderSchema);
