const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      default: 'login',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index to auto-delete expired OTPs
    },
  },
  {
    timestamps: true,
  }
);

otpSchema.index({ email: 1, otp: 1 });
otpSchema.index({ phoneNumber: 1, otp: 1 });

module.exports = mongoose.model('Otp', otpSchema);
