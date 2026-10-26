const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order',
      required: false,
      index: true,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      default: 'razorpay',
    },
    providerOrderId: {
      type: String,
      required: true,
      unique: true,
    },
    providerPaymentId: {
      type: String,
      sparse: true,
    },
    amount: {
      type: Number, // In paise
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['CREATED', 'PENDING', 'AUTHORIZED', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'CREATED',
    },
    method: {
      type: String, // e.g., upi, card, netbanking
    },
    failureReason: {
      type: String,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
