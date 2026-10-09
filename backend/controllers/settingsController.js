const asyncHandler = require('../utils/asyncHandler');
const Setting = require('../models/Setting');

// 1. Get Subscription Amount (GET /api/settings/subscription-amount) - Public API
const getSubscriptionAmount = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne({ key: 'subscriptionAmount' });

  if (!setting) {
    // Initialize default setting if not present in database
    setting = await Setting.create({
      key: 'subscriptionAmount',
      value: 149,
      description: 'Monthly subscription plan price in INR',
    });
  }

  const subscriptionAmount = !isNaN(Number(setting.value)) ? Number(setting.value) : 149;

  return res.status(200).json({
    subscriptionAmount,
  });
});

// 2. Update Subscription Amount (POST/PUT /api/settings/subscription-amount) - Admin API
const updateSubscriptionAmount = asyncHandler(async (req, res) => {
  const amount = req.body.subscriptionAmount ?? req.body.amount ?? req.body.value;

  if (amount === undefined || amount === null || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid subscription amount is required',
    });
  }

  const numericAmount = Number(amount);

  const setting = await Setting.findOneAndUpdate(
    { key: 'subscriptionAmount' },
    { value: numericAmount, description: 'Monthly subscription plan price in INR' },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return res.status(200).json({
    success: true,
    message: 'Subscription amount updated successfully',
    subscriptionAmount: Number(setting.value),
  });
});

module.exports = {
  getSubscriptionAmount,
  updateSubscriptionAmount,
};
