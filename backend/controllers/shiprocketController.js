const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const shiprocketService = require('../services/shiprocketService');
const Order = require('../models/Order');

const estimateDelivery = asyncHandler(async (req, res) => {
  const { deliveryPincode, weight, totalItems, items, paymentMethod = 'ONLINE', subtotal = 0 } = req.body;

  let calculatedWeight = Number(weight);
  if (!calculatedWeight || isNaN(calculatedWeight)) {
    if (items && Array.isArray(items) && items.length > 0) {
      const count = items.reduce((sum, it) => sum + (Number(it.quantity) || 1), 0);
      calculatedWeight = Math.max(0.5, count * 0.5);
    } else if (totalItems && Number(totalItems) > 0) {
      calculatedWeight = Math.max(0.5, Number(totalItems) * 0.5);
    } else {
      calculatedWeight = 0.5;
    }
  }

  const estimate = await shiprocketService.getServiceability(
    deliveryPincode,
    calculatedWeight,
    paymentMethod,
    subtotal
  );

  res.status(200).json(
    new ApiResponse(200, estimate, 'Live Shiprocket delivery estimate fetched successfully')
  );
});

/**
 * Explicitly place an order on Shiprocket and get live Shiprocket data
 */
const createOrderOnShiprocket = asyncHandler(async (req, res) => {
  const target = req.body.orderId || req.body.orderNumber || req.params.orderId;
  if (!target) {
    throw new ApiError(400, 'orderId or orderNumber is required');
  }

  const isObjectId = typeof target === 'string' && target.length === 24;
  const order = await Order.findOne({
    $or: [{ ...(isObjectId ? { _id: target } : {}) }, { orderNumber: target }, { shiprocketOrderId: target }],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found in database');
  }

  // If already has Shiprocket Order ID, return it
  if (order.shiprocketOrderId) {
    return res.status(200).json(
      new ApiResponse(200, {
        order,
        shiprocketOrderId: order.shiprocketOrderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
        alreadyPlaced: true,
      }, 'Order already placed on Shiprocket')
    );
  }

  try {
    const srData = await shiprocketService.createShiprocketOrder(order);
    if (srData && (srData.order_id || srData.shipment_id)) {
      order.shiprocketOrderId = String(srData.order_id || '');
      order.shiprocketShipmentId = String(srData.shipment_id || '');
      order.courierPartner = srData.courier_name || 'Shiprocket';
      order.shippingStatus = 'PLACED_ON_SHIPROCKET';
      if (srData.awb_code) order.trackingNumber = srData.awb_code;
      await order.save();
    }

    res.status(200).json(
      new ApiResponse(200, {
        order,
        shiprocket: srData,
        shiprocketOrderId: order.shiprocketOrderId,
        shiprocketShipmentId: order.shiprocketShipmentId,
      }, 'Order successfully placed on Shiprocket')
    );
  } catch (err) {
    console.error('Shiprocket order placement error:', err.response?.data || err.message);
    throw new ApiError(500, err.response?.data?.message || err.message || 'Failed to place order on Shiprocket');
  }
});

/**
 * Check Shiprocket live order status
 */
const checkShiprocketOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const isObjectId = typeof orderId === 'string' && orderId.length === 24;
  const order = await Order.findOne({
    $or: [{ ...(isObjectId ? { _id: orderId } : {}) }, { orderNumber: orderId }, { shiprocketOrderId: orderId }],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  let srData = null;
  if (order.shiprocketOrderId) {
    srData = await shiprocketService.getShiprocketOrder(order.shiprocketOrderId);
  }

  res.status(200).json(
    new ApiResponse(200, {
      order,
      shiprocket: srData,
      isPlacedOnShiprocket: !!order.shiprocketOrderId,
      shiprocketOrderId: order.shiprocketOrderId || null,
      shiprocketShipmentId: order.shiprocketShipmentId || null,
    }, 'Shiprocket order status checked successfully')
  );
});

module.exports = {
  estimateDelivery,
  createOrderOnShiprocket,
  checkShiprocketOrder,
};
