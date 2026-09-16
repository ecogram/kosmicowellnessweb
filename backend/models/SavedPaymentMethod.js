const mongoose = require('mongoose');

const savedPaymentMethodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    methodType: {
      type: String, // 'CARD', 'UPI', 'NETBANKING', 'WALLET'
      default: 'CARD',
    },
    title: {
      type: String, // e.g. "HDFC Debit Card", "Google Pay UPI"
      default: 'Payment Method',
    },
    cardLast4: {
      type: String,
    },
    cardNetwork: {
      type: String, // 'VISA', 'MASTERCARD', 'RUPAY', etc.
    },
    cardExpiry: {
      type: String, // 'MM/YY'
    },
    upiId: {
      type: String,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SavedPaymentMethod', savedPaymentMethodSchema);
