const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const getRazorpayInstance = () => {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_TcH3s5Qdh4ngAp',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '8HiA1PomM2gcACR54tAfnagQ',
  });
};

// 1. Create Subscription Order (POST /api/subscription/create-order)
const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const amountInPaise = 14900; // ₹149 in paise (Amount is hardcoded on server)
  const razorpay = getRazorpayInstance();

  const receipt = `sub_${Date.now().toString().slice(-8)}_${Math.floor(100 + Math.random() * 900)}`;

  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
    notes: {
      userId: req.user._id.toString(),
      userEmail: req.user.email || '',
      plan: 'kosmico_premium_monthly',
    },
  };

  try {
    const order = await razorpay.orders.create(options);
    return res.status(200).json({
      success: true,
      data: {
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    throw new ApiError(500, error.message || 'Failed to create subscription order');
  }
});

// 2. Verify Subscription Payment (POST /api/subscription/verify)
const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    throw new ApiError(400, 'Payment details (razorpay_order_id, razorpay_payment_id, razorpay_signature) are required');
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Invalid payment signature. Verification failed.');
  }

  // Update User as Active Subscriber with 30-Day Expiry
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const activatedAt = new Date();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days from now

  user.isSubscribed = true;
  user.subscriptionStatus = 'active';
  user.subscriptionDaysLeft = 30;
  user.subscription = {
    status: 'active',
    isActive: true,
    plan: 'kosmico_premium_monthly',
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    trialsRemaining: 0,
    totalTrials: 8,
    activatedAt,
    expiresAt,
  };

  await user.save();

  // Emit realtime profile update
  try {
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(req.user._id.toString(), 'profile:updated', { user });
    emitToUser(req.user._id.toString(), 'user:updated', { user });
  } catch (_) {}

  return res.status(200).json({
    success: true,
    message: 'Subscription verified and activated successfully',
    data: {
      isSubscribed: true,
      subscriptionDaysLeft: 30,
      user,
    },
  });
});

// 3. Check Subscription Status & Validity (GET /api/subscription/status)
const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let isSubscribed = Boolean(user.isSubscribed || user.subscriptionStatus === 'active');
  let subscriptionDaysLeft = 0;

  if (isSubscribed) {
    const expiresAt = user.subscription?.expiresAt;
    if (expiresAt) {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        // Expired automatically after 30 days
        isSubscribed = false;
        user.isSubscribed = false;
        user.subscriptionStatus = 'expired';
        user.subscriptionDaysLeft = 0;
        if (user.subscription) {
          user.subscription.isActive = false;
          user.subscription.status = 'expired';
        }
        await user.save();
        subscriptionDaysLeft = 0;
      } else {
        subscriptionDaysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        user.subscriptionDaysLeft = subscriptionDaysLeft;
      }
    } else {
      subscriptionDaysLeft = user.subscriptionDaysLeft || 30;
    }
  }

  const trials = user.trials || {
    plate_scan: 2,
    bp_scan: 2,
    community_post: 2,
    smartwatch_connect: 2,
  };

  // Response matches exact structure from doc image
  return res.status(200).json({
    isSubscribed,
    subscriptionDaysLeft,
    trials: {
      plate_scan: trials.plate_scan !== undefined ? trials.plate_scan : 2,
      bp_scan: trials.bp_scan !== undefined ? trials.bp_scan : 2,
      community_post: trials.community_post !== undefined ? trials.community_post : 2,
      smartwatch_connect: trials.smartwatch_connect !== undefined ? trials.smartwatch_connect : 2,
    },
    // Supporting enveloped format as well
    success: true,
    data: {
      isSubscribed,
      subscriptionDaysLeft,
      trials,
    },
  });
});

// 4. Consume Trial Feature (POST /api/subscription/trial/consume & POST /api/subscription/trial)
const consumeTrial = asyncHandler(async (req, res) => {
  const { feature } = req.body;

  const validFeatures = ['plate_scan', 'bp_scan', 'community_post', 'smartwatch_connect'];
  if (!feature || !validFeatures.includes(feature)) {
    throw new ApiError(400, `Invalid feature. Must be one of: ${validFeatures.join(', ')}`);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // If already subscribed, unlimited access is allowed
  if (user.isSubscribed || user.subscriptionStatus === 'active') {
    return res.status(200).json({
      success: true,
      allowed: true,
      remaining: 999,
      message: 'Unlimited access for active subscribers',
    });
  }

  // Initialize trials if missing
  if (!user.trials) {
    user.trials = {
      plate_scan: 2,
      bp_scan: 2,
      community_post: 2,
      smartwatch_connect: 2,
    };
  }

  const currentFeatureCount = user.trials[feature] !== undefined ? user.trials[feature] : 2;

  if (currentFeatureCount > 0) {
    const updatedCount = currentFeatureCount - 1;
    user.trials[feature] = updatedCount;
    user.markModified('trials');

    // Update total trials remaining
    const totalRemaining =
      (user.trials.plate_scan || 0) +
      (user.trials.bp_scan || 0) +
      (user.trials.community_post || 0) +
      (user.trials.smartwatch_connect || 0);

    user.trialsRemaining = totalRemaining;
    user.subscriptionTrialCount = totalRemaining;
    if (user.subscription) {
      user.subscription.trialsRemaining = totalRemaining;
    }

    await user.save();

    try {
      const { emitToUser } = require('../realtime/emitter');
      emitToUser(req.user._id.toString(), 'profile:updated', { user });
    } catch (_) {}

    return res.status(200).json({
      success: true,
      allowed: true,
      remaining: updatedCount,
    });
  } else {
    // Limit exhausted for this feature
    return res.status(200).json({
      success: true,
      allowed: false,
      remaining: 0,
    });
  }
});

module.exports = {
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSubscriptionStatus,
  consumeTrial,
};
