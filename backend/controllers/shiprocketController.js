const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const shiprocketService = require('../services/shiprocketService');

const estimateDelivery = asyncHandler(async (req, res) => {
  const { deliveryPincode, weight = 0.5, paymentMethod = 'ONLINE', subtotal = 0 } = req.body;

  const estimate = await shiprocketService.getServiceability(
    deliveryPincode,
    weight,
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
