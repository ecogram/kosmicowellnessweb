const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Order = require('../models/Order');

// Track order (by _id or orderNumber)
const trackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);

  const query = isObjectId
    ? { $or: [{ _id: orderId }, { orderNumber: orderId }] }
    : { orderNumber: orderId };

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Generate realistic tracking timeline
  const trackingDetails = {
    orderNumber: order.orderNumber,
    currentStatus: order.orderStatus,
    courierPartner: order.courierPartner || 'Shiprocket / Bluedart',
    trackingNumber: order.trackingNumber || 'TRK-' + order.orderNumber.slice(-8),
    estimatedDeliveryDate: new Date(new Date(order.createdAt).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timeline: [
      {
        status: 'Order Placed',
        description: 'Your order has been received.',
        timestamp: order.createdAt,
        completed: true,
      },
      {
        status: 'Processing & Packed',
        description: 'Order is being prepared at our fulfillment center.',
        timestamp: new Date(new Date(order.createdAt).getTime() + 2 * 60 * 60 * 1000),
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.orderStatus),
      },
      {
        status: 'Handed to Courier',
        description: `Package picked up by ${order.courierPartner || 'Shiprocket'}`,
        timestamp: new Date(new Date(order.createdAt).getTime() + 18 * 60 * 60 * 1000),
        completed: ['SHIPPED', 'DELIVERED'].includes(order.orderStatus),
      },
      {
        status: 'Delivered',
        description: 'Package delivered to shipping address.',
        timestamp: order.orderStatus === 'DELIVERED' ? new Date() : null,
        completed: order.orderStatus === 'DELIVERED',
      },
    ],
  };

  res.status(200).json(new ApiResponse(200, trackingDetails, 'Order tracking details retrieved'));
});

// Cancel Order
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);

  const query = isObjectId
    ? { $or: [{ _id: orderId }, { orderNumber: orderId }], user: req.user._id }
    : { orderNumber: orderId, user: req.user._id };

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (['SHIPPED', 'DELIVERED'].includes(order.orderStatus)) {
    throw new ApiError(400, 'Cannot cancel an order that has already shipped or delivered. Please initiate a return.');
  }

  order.orderStatus = 'CANCELLED';
  order.cancelReason = req.body.reason || 'Cancelled by user';
  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
});

// Return Order
const returnOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);

  const query = isObjectId
    ? { $or: [{ _id: orderId }, { orderNumber: orderId }], user: req.user._id }
    : { orderNumber: orderId, user: req.user._id };

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.returnReason = reason || 'Return requested by customer';
  order.refundStatus = 'INITIATED';
  await order.save();

  res.status(200).json(new ApiResponse(200, { order }, 'Return request initiated successfully'));
});

// Initiate Refund
const initiateRefund = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);

  const query = isObjectId
    ? { $or: [{ _id: orderId }, { orderNumber: orderId }], user: req.user._id }
    : { orderNumber: orderId, user: req.user._id };

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.refundStatus = 'INITIATED';
  order.returnReason = reason || order.returnReason || 'Refund requested';
  await order.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        refundId: 'REF-' + Date.now().toString().slice(-6),
        orderNumber: order.orderNumber,
        refundAmount: order.total,
        status: 'INITIATED',
        expectedDays: '5 - 7 Business Days',
      },
      'Refund initiated successfully'
    )
  );
});

// Get My Refunds
const getMyRefunds = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    refundStatus: { $in: ['INITIATED', 'PROCESSED'] },
  }).sort({ updatedAt: -1 });

  const refunds = orders.map((o) => ({
    refundId: 'REF-' + o._id.toString().slice(-6),
    orderNumber: o.orderNumber,
    amount: o.total,
    status: o.refundStatus,
    reason: o.returnReason || o.cancelReason || 'Customer requested',
    date: o.updatedAt,
  }));

  res.status(200).json(new ApiResponse(200, refunds, 'Refunds retrieved successfully'));
});

module.exports = {
  trackOrder,
  cancelOrder,
  returnOrder,
  initiateRefund,
  getMyRefunds,
};
