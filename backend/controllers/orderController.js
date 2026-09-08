const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const orderService = require('../services/orderService');

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, billingAddress, paymentMethod } = req.body;
  const idempotencyKey = req.headers['idempotency-key'] || req.headers['x-idempotency-key'];

  if (!shippingAddress) {
    throw new ApiError(400, 'Shipping address is required');
  }
  if (!idempotencyKey) {
    throw new ApiError(400, 'Idempotency-Key header is required');
  }

  const order = await orderService.createOrder(req.user._id, shippingAddress, billingAddress, idempotencyKey, paymentMethod);
  res.status(201).json(new ApiResponse(201, { order }, 'Order created successfully'));
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrder(req.params.orderNumber, req.user._id);
  res.status(200).json(new ApiResponse(200, { order }, 'Order retrieved'));
});

const getUserOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getUserOrders(req.user._id, req.query);
  const response = new ApiResponse(200, { orders: result.data }, 'User orders retrieved');
  response.meta = result.meta;
  res.status(200).json(response);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.params.orderNumber, req.user._id);
  res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled successfully'));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await orderService.updateOrderStatus(req.params.id, status);
  res.status(200).json(new ApiResponse(200, { order }, 'Order status updated'));
});

module.exports = {
  createOrder,
  getOrder,
  getUserOrders,
  cancelOrder,
  updateOrderStatus,
};
