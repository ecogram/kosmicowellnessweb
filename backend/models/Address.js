const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    addressLabel: {
      type: String,
      default: 'Home',
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
    },
    streetAddress: {
      type: String,
      required: [true, 'Please provide street address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide city'],
      trim: true,
    },
    state: {
      type: String,
      default: '',
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, 'Please provide pincode'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
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

module.exports = mongoose.model('Address', addressSchema);
