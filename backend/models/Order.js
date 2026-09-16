const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
    },
    userEmail: {
      type: String,
      index: true,
    },
    items: {
      type: Array,
      default: [],
    },
    amount: {
      type: Number,
    },
    total: {
      type: Number,
    },
    subtotal: {
      type: Number,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    shipping: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    gstCharge: {
      type: Number,
      default: 0,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.Mixed,
    },
    deliveryAddress: {
      type: mongoose.Schema.Types.Mixed,
    },
    billingAddress: {
      type: mongoose.Schema.Types.Mixed,
    },
    orderStatus: {
      type: String,
      default: 'PENDING',
    },
    paymentStatus: {
      type: String,
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      default: 'COD',
    },
    paymentReference: {
      type: String,
    },
    courierPartner: {
      type: String,
      default: 'Shiprocket / Bluedart',
    },
    trackingNumber: {
      type: String,
      default: '',
    },
    shiprocketOrderId: {
      type: String,
    },
    shiprocketShipmentId: {
      type: String,
    },
    upfrontAmount: {
      type: Number,
      default: 0,
    },
    upfrontPaymentStatus: {
      type: String,
      default: 'Pending',
    },
    cancelReason: {
      type: String,
      default: '',
    },
    returnReason: {
      type: String,
      default: '',
    },
    refundStatus: {
      type: String,
      default: 'NONE',
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

orderSchema.index({ user: 1 });
orderSchema.index({ userEmail: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ shiprocketOrderId: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema, 'orders');
