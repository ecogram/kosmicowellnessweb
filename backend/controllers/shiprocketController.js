const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const shiprocketService = require('../services/shiprocketService');

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

const createOrder = asyncHandler(async (req, res) => {
  const { orderId, internalOrderId } = req.body;
  const targetId = orderId || internalOrderId || req.params.orderId;

  if (!targetId) {
    throw new ApiError(400, 'Order ID is required to sync with Shiprocket');
  }

  const result = await shiprocketService.createOrder(targetId);

  if (!result.success) {
    return res.status(400).json(
      new ApiResponse(400, result, result.error || 'Failed to sync with Shiprocket')
    );
  }

  res.status(200).json(
    new ApiResponse(200, result, 'Order successfully synced to Shiprocket')
  );
});

const trackShipment = asyncHandler(async (req, res) => {
  const shipmentId = req.params.shipmentId || req.query.shipmentId;
  if (!shipmentId) {
    throw new ApiError(400, 'Shipment ID is required');
  }

  const tracking = await shiprocketService.trackShipment(shipmentId);
  res.status(200).json(
    new ApiResponse(200, tracking, 'Shiprocket tracking fetched successfully')
  );
});

module.exports = {
  estimateDelivery,
  createOrder,
  trackShipment,
};

