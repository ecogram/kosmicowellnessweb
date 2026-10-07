const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const User = require('../models/User');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

// 1. Create Subscription Order (POST /api/subscription/create-order)
const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const amountInPaise = 14900; // ₹149 in paise

  if (!razorpay) {
    throw new ApiError(500, 'Razorpay instance not configured on server');
  }

  const receipt = `sub_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
    notes: {
      userId: req.user._id.toString(),
      userEmail: req.user.email,
      plan: 'kosmico_premium_monthly',
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return res.status(200).json(
      new ApiResponse(200, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
      }, 'Subscription order created successfully')
    );
  } catch (error) {
    throw new ApiError(500, error.message || 'Failed to create subscription order');
  }
});

// 2. Verify Subscription Payment (POST /api/subscription/verify)
const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new ApiError(400, 'Payment details are missing for verification');
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Invalid payment signature. Verification failed.');
  }

  // Update User as Active Subscriber
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isSubscribed = true;
  user.subscriptionStatus = 'active';
  user.subscription = {
    status: 'active',
    isActive: true,
    plan: 'kosmico_premium_monthly',
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    trialsRemaining: 0,
    totalTrials: 8,
    activatedAt: new Date(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  };

  await user.save();

  // Emit realtime event
  try {
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(req.user._id.toString(), 'profile:updated', { user });
    emitToUser(req.user._id.toString(), 'user:updated', { user });
  } catch (_) {}

  return res.status(200).json(
    new ApiResponse(200, {
      success: true,
      user,
      isSubscribed: true,
    }, 'Subscription activated successfully')
  );
});

// 3. Get Subscription Status (GET /api/subscription/status)
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isSubscribed = Boolean(
    user.isSubscribed ||
    user.subscriptionStatus === 'active' ||
    user.subscription?.isActive
  );

  const trialsRemaining = typeof user.trialsRemaining === 'number'
    ? user.trialsRemaining
    : (user.subscription?.trialsRemaining ?? 8);

  return res.status(200).json(
    new ApiResponse(200, {
      isSubscribed,
      subscriptionStatus: isSubscribed ? 'active' : 'trial',
      trialsRemaining: isSubscribed ? 0 : trialsRemaining,
      totalTrials: 8,
      featureTrials: user.featureTrials || {
        feature1: 2,
        feature2: 2,
        feature3: 2,
        feature4: 2,
      },
      subscription: user.subscription,
    }, 'Subscription status fetched')
  );
});

// 4. Consume / Use a Free Trial (POST /api/subscription/use-trial)
const useTrial = asyncHandler(async (req, res) => {
  const { featureKey } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.isSubscribed || user.subscriptionStatus === 'active') {
    return res.status(200).json(
      new ApiResponse(200, {
        isSubscribed: true,
        trialsRemaining: 0,
        message: 'Unlimited access (Subscriber)',
      })
    );
  }

  const currentTrials = typeof user.trialsRemaining === 'number' ? user.trialsRemaining : 8;
  if (currentTrials <= 0) {
    throw new ApiError(403, 'Free trials exhausted. Please upgrade to continue.');
  }

  user.trialsRemaining = Math.max(0, currentTrials - 1);
  if (!user.subscription) user.subscription = {};
  user.subscription.trialsRemaining = user.trialsRemaining;
  user.subscriptionTrialCount = user.trialsRemaining;

  if (featureKey && user.featureTrials && user.featureTrials[featureKey] !== undefined) {
    user.featureTrials[featureKey] = Math.max(0, user.featureTrials[featureKey] - 1);
  }

  await user.save();

  try {
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(req.user._id.toString(), 'profile:updated', { user });
    emitToUser(req.user._id.toString(), 'user:updated', { user });
  } catch (_) {}

  return res.status(200).json(
    new ApiResponse(200, {
      trialsRemaining: user.trialsRemaining,
      featureTrials: user.featureTrials,
    }, 'Trial consumed successfully')
  );
});

module.exports = {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionStatus,
  useTrial,
};
