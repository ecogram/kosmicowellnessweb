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

module.exports = {
  estimateDelivery,
};
