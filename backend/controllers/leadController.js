const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Lead = require('../models/Lead');
const Coupon = require('../models/Coupon');

// Automatically ensure SWEET10 (10% OFF) coupon exists in database
const ensureSweet10Coupon = async () => {
  try {
    const existing = await Coupon.findOne({ code: 'SWEET10' });
    if (!existing) {
      await Coupon.create({
        code: 'SWEET10',
        description: 'Flat 10% OFF for Welcome Web Visitors',
        discountType: 'percentage',
        discountValue: 10,
        maxDiscount: 200,
        minOrderAmount: 0,
        isActive: true,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
      });
    }
  } catch (err) {
    console.error('Error ensuring SWEET10 coupon:', err.message);
  }
};

/**
 * Capture guest lead from web popup
 * POST /api/leads/capture or POST /api/leads
 */
const captureLead = asyncHandler(async (req, res) => {
  const { phoneNumber, name, page } = req.body;

  if (!phoneNumber) {
    throw new ApiError(400, 'Phone number is required');
  }

  // Clean phone number (strip spaces, dashes, +91)
  let cleanPhone = String(phoneNumber).replace(/[\s\-\(\)\+]/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.slice(2);
  }

  if (cleanPhone.length < 10) {
    throw new ApiError(400, 'Please enter a valid 10-digit mobile number');
  }

  const platformHeader = req.headers['x-platform'];
  const source = platformHeader === 'web' ? 'web_popup' : 'web_guest';

  // Ensure coupon exists in database
  await ensureSweet10Coupon();

  // Create lead record (allows capturing repeated visits with latest timestamp)
  const lead = await Lead.create({
    phoneNumber: cleanPhone,
    name: name ? String(name).trim() : 'Guest Visitor',
    source,
    discountCode: 'SWEET10',
    discountPercent: 10,
    page: page || '/',
    ip: req.ip || '',
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        leadId: lead._id,
        phoneNumber: cleanPhone,
        couponCode: 'SWEET10',
        discountPercent: 10,
        message: 'Your 10% OFF coupon code SWEET10 is unlocked!',
      },
      'Welcome! Flat 10% OFF coupon code SWEET10 is ready to use.'
    )
  );
});

/**
 * Get all captured leads (protected)
 * GET /api/leads
 */
const getLeads = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.source) {
    filter.source = req.query.source;
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Lead.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        leads,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Leads retrieved successfully'
    )
  );
});

module.exports = {
  captureLead,
  getLeads,
};
