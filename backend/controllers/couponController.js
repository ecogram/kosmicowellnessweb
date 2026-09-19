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
  const coupons = await Coupon.find({ isActive: true }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, coupons, 'Coupons fetched successfully'));
});

// Admin Controllers
const getAllAdminCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, coupons, 'All coupons fetched successfully'));
});

const createCoupon = asyncHandler(async (req, res) => {
  const { code, description, discountType, discountValue, maxDiscount, minOrderAmount, expiresAt, isActive } = req.body;

  if (!code || !discountValue) {
    throw new ApiError(400, 'Coupon code and discount value are required');
  }

  const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (existing) {
    throw new ApiError(400, 'Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code: code.trim().toUpperCase(),
    description: description || '',
    discountType: discountType || 'percentage',
    discountValue: Number(discountValue),
    maxDiscount: maxDiscount ? Number(maxDiscount) : null,
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
    expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(new ApiResponse(201, coupon, 'Coupon created successfully'));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  res.status(200).json(new ApiResponse(200, coupon, 'Coupon updated successfully'));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const coupon = await Coupon.findByIdAndDelete(id);

  if (!coupon) {
    throw new ApiError(404, 'Coupon not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'Coupon deleted successfully'));
});

module.exports = {
  getCoupons,
  applyCoupon,
  getAllAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
