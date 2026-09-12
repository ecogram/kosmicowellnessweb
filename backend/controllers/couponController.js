const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Coupon = require('../models/Coupon');


const applyCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code) {
    throw new ApiError(400, 'Coupon code is required');
  }

  const amount = Number(orderAmount) || 0;
  const coupon = await Coupon.findOne({
    code: code.trim().toUpperCase(),
    isActive: true,
  });

  if (!coupon) {
    throw new ApiError(404, 'Invalid coupon code');
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new ApiError(400, 'This coupon has expired');
  }

  if (amount < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`);
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, amount);
  const finalAmount = Math.max(0, amount - discountAmount);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        code: coupon.code,
        discountAmount,
        finalAmount,
        originalAmount: amount,
        description: coupon.description,
      },
      'Coupon applied successfully'
    )
  );
});

const getCoupons = asyncHandler(async (req, res) => {
  let coupons = await Coupon.find({ isActive: true });
  if (coupons.length === 0) {
    coupons = await Coupon.create([
      {
        code: 'WELCOME10',
        description: 'Get 10% off on your order',
        discountType: 'percentage',
        discountValue: 10,
        minOrderAmount: 299,
        isActive: true,
      },
      {
        code: 'KOSMICO50',
        description: 'Flat ₹50 off on wellness orders',
        discountType: 'fixed',
        discountValue: 50,
        minOrderAmount: 499,
        isActive: true,
      },
    ]);
  }
  res.status(200).json(new ApiResponse(200, coupons, 'Coupons fetched successfully'));
});

module.exports = {
  getCoupons,
  applyCoupon,
};
