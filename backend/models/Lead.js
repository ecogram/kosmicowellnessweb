const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a valid phone number'],
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: 'Guest Visitor',
    },
    source: {
      type: String,
      default: 'web_popup',
      index: true,
    },
    discountCode: {
      type: String,
      default: 'SWEET10',
    },
    discountPercent: {
      type: Number,
      default: 10,
    },
    page: {
      type: String,
      default: '/',
    },
    ip: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({ phoneNumber: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
