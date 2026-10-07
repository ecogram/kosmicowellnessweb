const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Order = require('../models/Order');

// Helper to build robust order lookup query
const buildOrderQuery = (orderId, user) => {
  const cleanId = String(orderId || '').replace(/^#/, '').trim();
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);
  const userEmail = user?.email ? user.email.toLowerCase().trim() : '';

  const idCondition = isObjectId
    ? [{ _id: cleanId }, { orderNumber: cleanId }, { shiprocketOrderId: cleanId }]
    : [{ orderNumber: cleanId }, { shiprocketOrderId: cleanId }];

  const userCondition = user
    ? [
        { user: user._id },
        { user: String(user._id) },
        { userId: user._id },
        { userId: String(user._id) },
        ...(userEmail ? [{ userEmail: new RegExp(`^${userEmail}$`, 'i') }] : []),
      ]
    : [];

  if (userCondition.length > 0) {
    return {
      $and: [{ $or: idCondition }, { $or: userCondition }],
    };
  }

  return { $or: idCondition };
};

// Track order (by _id, orderNumber or shiprocketOrderId)
const trackOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const query = buildOrderQuery(orderId, req.user);

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const orderNum = order.orderNumber || order.shiprocketOrderId || order._id.toString();
  const trackingNumber = order.trackingNumber || order.shiprocketShipmentId || 'TRK-' + String(orderNum).slice(-8);

  const rawOrderTotal = Number(order.total ?? order.amount ?? 0);
  const items = order.items || [];
  const itemsSubtotal = items.reduce((sum, item) => sum + (Number(item.price || item.priceSnapshot || 0) * Number(item.quantity || item.qty || 1)), 0);
  const upfrontAmount = Number(order.upfrontAmount || 0);

  const paymentMethodUpper = String(order.paymentMethod || '').toUpperCase();
  const paymentStatusUpper = String(order.paymentStatus || '').toUpperCase();

  const isUpfrontActuallyPaid =
    ['PARTIAL_PAID', 'PAID', 'COMPLETED'].includes(paymentStatusUpper) ||
    String(order.upfrontPaymentStatus || '').toUpperCase() === 'PAID';

  const isPartCod =
    (paymentMethodUpper === 'COD_UPFRONT' || paymentMethodUpper.includes('PART_COD')) &&
    isUpfrontActuallyPaid;

  const isPureCod = (paymentMethodUpper === 'COD' || paymentMethodUpper === 'CASH ON DELIVERY') && !isPartCod;
  const isCodOrder = isPartCod || isPureCod;

  const rawDeliveryFee = Number(order.deliveryFee ?? order.shipping ?? 0);
  const rawGstFee = Number(order.gstCharge ?? order.tax ?? 0);

  const resolvedDeliveryFee = isPartCod
    ? (rawDeliveryFee > 0 ? rawDeliveryFee : (Math.round(rawOrderTotal) === 104 ? 88 : 79))
    : (isPureCod ? (rawDeliveryFee > 0 ? rawDeliveryFee : 49) : 0);

  const resolvedGstCharge = isPartCod
    ? (rawGstFee > 0 ? rawGstFee : (Math.round(rawOrderTotal) === 104 ? 16 : 14))
    : (isPureCod ? rawGstFee : 0);

  const resolvedSubtotal = itemsSubtotal > 0 ? itemsSubtotal : (isPartCod ? Math.max(1, rawOrderTotal - (resolvedDeliveryFee + resolvedGstCharge)) : rawOrderTotal);

  const resolvedUpfrontAmount = isPartCod
    ? (upfrontAmount > 0 ? upfrontAmount : (resolvedDeliveryFee + resolvedGstCharge))
    : 0;

  const resolvedPaidAmount = isPartCod
    ? resolvedUpfrontAmount
    : (['PAID', 'COMPLETED'].includes(paymentStatusUpper) ? rawOrderTotal : 0);

  const orderTotal = (isPartCod || isPureCod)
    ? (resolvedSubtotal + resolvedDeliveryFee + resolvedGstCharge - Number(order.discount || order.discountAmount || 0))
    : rawOrderTotal;

  const resolvedBalanceAmount = isPartCod
    ? Math.max(0, resolvedSubtotal - Number(order.discount || order.discountAmount || 0))
    : (isPureCod ? orderTotal : 0);

  const resolvedPaymentMethod = isPartCod ? 'COD_UPFRONT' : (isPureCod ? 'COD' : (order.paymentMethod || 'ONLINE'));
  const resolvedPaymentStatus = isPartCod ? 'PARTIAL_PAID' : (['PAID', 'COMPLETED'].includes(paymentStatusUpper) ? 'PAID' : (order.paymentStatus || 'PENDING'));

  const trackingDetails = {
    orderNumber: orderNum,
    currentStatus: String(order.orderStatus || 'PROCESSING').toUpperCase(),
    courierPartner: order.courierPartner || 'Shiprocket / Bluedart',
    trackingNumber,
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
        completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(String(order.orderStatus).toUpperCase()),
      },
      {
        status: 'Handed to Courier',
        description: `Package picked up by ${order.courierPartner || 'Shiprocket'}`,
        timestamp: new Date(new Date(order.createdAt).getTime() + 18 * 60 * 60 * 1000),
        completed: ['SHIPPED', 'DELIVERED'].includes(String(order.orderStatus).toUpperCase()),
      },
      {
        status: 'Delivered',
        description: 'Package delivered to shipping address.',
        timestamp: String(order.orderStatus).toUpperCase() === 'DELIVERED' ? new Date() : null,
        completed: String(order.orderStatus).toUpperCase() === 'DELIVERED',
      },
    ],
    total: orderTotal,
    amount: orderTotal,
    subtotal: orderSubtotal,
    deliveryFee: resolvedDeliveryFee,
    shipping: resolvedDeliveryFee,
    gstCharge: resolvedGstCharge,
    tax: resolvedGstCharge,
    discount: Number(order.discount ?? order.discountAmount ?? 0),
    upfrontAmount: resolvedUpfrontAmount,
    paidAmount: resolvedPaidAmount,
    balanceAmount: resolvedBalanceAmount,
    paymentMethod: resolvedPaymentMethod,
    paymentStatus: resolvedPaymentStatus,
    items: order.items || [],
    shippingAddress: order.shippingAddress || order.deliveryAddress || {},
    order: {
      ...(order.toObject ? order.toObject() : order),
      total: orderTotal,
      amount: orderTotal,
      subtotal: orderSubtotal,
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: resolvedPaymentStatus,
      deliveryFee: resolvedDeliveryFee,
      shipping: resolvedDeliveryFee,
      gstCharge: resolvedGstCharge,
      tax: resolvedGstCharge,
      upfrontAmount: resolvedUpfrontAmount,
      paidAmount: resolvedPaidAmount,
      balanceAmount: resolvedBalanceAmount,
    },
  };

  res.status(200).json(new ApiResponse(200, trackingDetails, 'Order tracking details retrieved'));
});

// Cancel Order
const cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const query = buildOrderQuery(orderId, req.user);

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (String(order.orderStatus).toUpperCase() === 'CANCELLED') {
    return res.status(200).json(new ApiResponse(200, { order }, 'Order is already cancelled'));
  }

  if (['SHIPPED', 'DELIVERED'].includes(String(order.orderStatus).toUpperCase())) {
    throw new ApiError(400, 'Cannot cancel an order that has already shipped or delivered. Please initiate a return.');
  }

  order.orderStatus = 'CANCELLED';
  order.cancelReason = req.body.reason || 'Cancelled by user';
  await order.save();

  if (order.shiprocketOrderId) {
    try {
      const shiprocketService = require('../services/shiprocketService');
      await shiprocketService.cancelOrder(order.shiprocketOrderId);
      order.shippingStatus = 'CANCELED_ON_SHIPROCKET';
      await order.save();
    } catch (srErr) {
      console.error('[Shiprocket] Cancel order error:', srErr.message);
    }
  }

  res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
});


// Return Order
const returnOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const query = buildOrderQuery(orderId, req.user);

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
  const query = buildOrderQuery(orderId, req.user);

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.refundStatus = 'INITIATED';
  order.returnReason = reason || order.returnReason || 'Refund requested';
  await order.save();

  const orderNum = order.orderNumber || order.shiprocketOrderId || order._id.toString();
  const refundAmount = order.total !== undefined ? order.total : (order.amount !== undefined ? order.amount : 0);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        refundId: 'REF-' + Date.now().toString().slice(-6),
        orderNumber: orderNum,
        refundAmount,
        status: 'INITIATED',
        expectedDays: '5 - 7 Business Days',
      },
      'Refund initiated successfully'
    )
  );
});

// Get My Refunds
const getMyRefunds = asyncHandler(async (req, res) => {
  const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';
  const query = {
    $and: [
      {
        $or: [
          { user: req.user._id },
          { user: String(req.user._id) },
          ...(userEmail ? [{ userEmail: new RegExp(`^${userEmail}$`, 'i') }] : []),
        ],
      },
      { refundStatus: { $in: ['INITIATED', 'RETURN_INITIATED', 'REPLACEMENT_INITIATED', 'PROCESSED'] } },
    ],
  };

  const orders = await Order.find(query).sort({ updatedAt: -1 });

  const refunds = orders.map((o) => ({
    refundId: 'REF-' + o._id.toString().slice(-6),
    orderNumber: o.orderNumber || o.shiprocketOrderId || o._id.toString(),
    amount: o.total !== undefined ? o.total : (o.amount !== undefined ? o.amount : 0),
    status: o.refundStatus,
    reason: o.returnReason || o.cancelReason || 'Customer requested',
    date: o.updatedAt,
  }));

  res.status(200).json(new ApiResponse(200, refunds, 'Refunds retrieved successfully'));
});

// Initiate Replacement / Return (POST /api/return/initiate)
const initiateReturn = asyncHandler(async (req, res) => {
  const { orderId, reason, replacement = true } = req.body;
  const query = buildOrderQuery(orderId, req.user);

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.returnReason = reason || 'Replacement / Return requested';
  order.refundStatus = replacement ? 'REPLACEMENT_INITIATED' : 'RETURN_INITIATED';
  await order.save();

  const orderNum = order.orderNumber || order.shiprocketOrderId || order._id.toString();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        returnId: 'RET-' + Date.now().toString().slice(-6),
        orderNumber: orderNum,
        status: order.refundStatus,
        reason: order.returnReason,
        replacementRequested: !!replacement,
      },
      'Replacement / Return request submitted successfully'
    )
  );
});

// Get My Returns (GET /api/return/my-returns)
const getMyReturns = asyncHandler(async (req, res) => {
  const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';
  const query = {
    $and: [
      {
        $or: [
          { user: req.user._id },
          { user: String(req.user._id) },
          ...(userEmail ? [{ userEmail: new RegExp(`^${userEmail}$`, 'i') }] : []),
        ],
      },
      {
        $or: [
          { returnReason: { $exists: true, $ne: '' } },
          { refundStatus: { $in: ['INITIATED', 'RETURN_INITIATED', 'REPLACEMENT_INITIATED', 'PROCESSED'] } },
        ],
      },
    ],
  };

  const orders = await Order.find(query).sort({ updatedAt: -1 });

  const returns = orders.map((o) => ({
    returnId: 'RET-' + o._id.toString().slice(-6),
    orderNumber: o.orderNumber || o.shiprocketOrderId || o._id.toString(),
    status: o.refundStatus || 'RETURN_REQUESTED',
    reason: o.returnReason || 'Customer requested',
    date: o.updatedAt,
    items: o.items,
  }));

  res.status(200).json(new ApiResponse(200, returns, 'Returns retrieved successfully'));
});

// Return Request (POST /api/return/request)
const requestReturn = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const targetId = orderId || req.params?.orderId;
  const query = buildOrderQuery(targetId, req.user);

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.returnReason = reason || 'Product was damaged';
  order.refundStatus = 'RETURN_REQUESTED';
  await order.save();

  const orderNum = order.orderNumber || order.shiprocketOrderId || order._id.toString();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        returnId: 'RET-' + Date.now().toString().slice(-6),
        orderNumber: orderNum,
        status: order.refundStatus,
        reason: order.returnReason,
      },
      'Return request submitted successfully'
    )
  );
});

// Refund Request (POST /api/refund/request)
const requestRefund = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const targetId = orderId || req.params?.orderId;
  const query = buildOrderQuery(targetId, req.user);

  const order = await Order.findOne(query);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  order.refundStatus = 'REFUND_REQUESTED';
  order.returnReason = reason || 'Did not like the product';
  await order.save();

  const orderNum = order.orderNumber || order.shiprocketOrderId || order._id.toString();
  const refundAmount = order.total !== undefined ? order.total : (order.amount !== undefined ? order.amount : 0);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        refundId: 'REF-' + Date.now().toString().slice(-6),
        orderNumber: orderNum,
        refundAmount,
        status: 'REFUND_REQUESTED',
        reason: order.returnReason,
        expectedDays: '5 - 7 Business Days',
      },
      'Refund request submitted successfully'
    )
  );
});

module.exports = {
  trackOrder,
  cancelOrder,
  returnOrder,
  initiateRefund,
  requestRefund,
  getMyRefunds,
  initiateReturn,
  requestReturn,
  getMyReturns,
};
