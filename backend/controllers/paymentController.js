const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const paymentService = require('../services/paymentService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Address = require('../models/Address');
const { sendOrderConfirmationEmail } = require('../utils/email');

// Helper to generate readable order number
const generateOrderNumber = () => {
  return 'KW' + Date.now().toString().slice(-8) + Math.floor(100 + Math.random() * 900);
};

// 1. Place COD Order (POST /api/payment/cod)
const placeCodOrder = asyncHandler(async (req, res) => {
  const {
    amount,
    deliveryAddressId,
    shippingAddress: directAddress,
    items,
    couponCode,
    discountAmount = 0,
    deliveryFee = 49,
    gstCharge = 0,
  } = req.body;

  let addressData = directAddress;
  if (!addressData && deliveryAddressId) {
    const foundAddr = await Address.findOne({ _id: deliveryAddressId, user: req.user._id });
    if (foundAddr) {
      addressData = {
        fullName: foundAddr.fullName,
        phone: foundAddr.phoneNumber,
        addressLine1: foundAddr.streetAddress,
        city: foundAddr.city,
        state: foundAddr.state || foundAddr.city,
        postalCode: foundAddr.pincode,
        country: 'India',
      };
    }
  }

  if (!addressData) {
    addressData = {
      fullName: req.user.name || 'Valued Customer',
      phone: req.user.phoneNumber || '9876543210',
      addressLine1: 'Default Address',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    };
  }

  // Format order items
  const formattedItems = [];
  let calculatedSubtotal = 0;

  if (items && Array.isArray(items) && items.length > 0) {
    for (const it of items) {
      const pId = it.productId || it._id || it.product;
      let pName = it.name || 'Kosmico Product';
      let pPrice = Number(it.price || it.priceSnapshot) || 0;
      let pImage = it.image || '';

      if (pId) {
        const dbProd = await Product.findById(pId);
        if (dbProd) {
          pName = dbProd.title || dbProd.name || pName;
          pPrice = dbProd.discountPrice || dbProd.price || pPrice;
          pImage = (dbProd.images && dbProd.images[0]?.url) || dbProd.image || pImage;
        }
      }

      const qty = Number(it.quantity) || 1;
      calculatedSubtotal += pPrice * qty;

      formattedItems.push({
        product: pId || req.user._id,
        name: pName,
        priceSnapshot: pPrice,
        quantity: qty,
        image: pImage,
      });
    }
  }

  const finalTotal = amount || Math.max(0, calculatedSubtotal - Number(discountAmount) + Number(deliveryFee) + Number(gstCharge));

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: formattedItems,
    subtotal: calculatedSubtotal || finalTotal,
    discount: Number(discountAmount) || 0,
    shipping: Number(deliveryFee) || 0,
    tax: Number(gstCharge) || 0,
    total: finalTotal,
    shippingAddress: addressData,
    billingAddress: addressData,
    orderStatus: 'PROCESSING',
    paymentStatus: 'PENDING',
    paymentMethod: 'COD',
    trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
  });

  // Attempt to send email async
  try {
    await sendOrderConfirmationEmail(order, req.user);
  } catch (err) {
    console.error('Email error:', err);
  }

  res.status(201).json(new ApiResponse(201, { order }, 'COD Order placed successfully'));
});

// 2. Create Razorpay Order (POST /api/payment/razorpay/create)
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, deliveryAddressId, shippingAddress: directAddress, items, discountAmount = 0, deliveryFee = 0, gstCharge = 0 } = req.body;

  let addressData = directAddress;
  if (!addressData && deliveryAddressId) {
    const foundAddr = await Address.findOne({ _id: deliveryAddressId, user: req.user._id });
    if (foundAddr) {
      addressData = {
        fullName: foundAddr.fullName,
        phone: foundAddr.phoneNumber,
        addressLine1: foundAddr.streetAddress,
        city: foundAddr.city,
        state: foundAddr.state || foundAddr.city,
        postalCode: foundAddr.pincode,
        country: 'India',
      };
    }
  }

  if (!addressData) {
    addressData = {
      fullName: req.user.name || 'Valued Customer',
      phone: req.user.phoneNumber || '9876543210',
      addressLine1: 'Default Address',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
    };
  }

  const formattedItems = [];
  let calculatedSubtotal = 0;

  if (items && Array.isArray(items) && items.length > 0) {
    for (const it of items) {
      const pId = it.productId || it._id || it.product;
      let pName = it.name || 'Kosmico Product';
      let pPrice = Number(it.price || it.priceSnapshot) || 0;
      let pImage = it.image || '';

      if (pId) {
        const dbProd = await Product.findById(pId);
        if (dbProd) {
          pName = dbProd.title || dbProd.name || pName;
          pPrice = dbProd.discountPrice || dbProd.price || pPrice;
          pImage = (dbProd.images && dbProd.images[0]?.url) || dbProd.image || pImage;
        }
      }

      const qty = Number(it.quantity) || 1;
      calculatedSubtotal += pPrice * qty;

      formattedItems.push({
        product: pId || req.user._id,
        name: pName,
        priceSnapshot: pPrice,
        quantity: qty,
        image: pImage,
      });
    }
  }

  const finalTotal = amount || Math.max(0, calculatedSubtotal - Number(discountAmount) + Number(deliveryFee) + Number(gstCharge));

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: formattedItems,
    subtotal: calculatedSubtotal || finalTotal,
    discount: Number(discountAmount) || 0,
    shipping: Number(deliveryFee) || 0,
    tax: Number(gstCharge) || 0,
    total: finalTotal,
    shippingAddress: addressData,
    billingAddress: addressData,
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: 'ONLINE',
  });

  const paymentData = await paymentService.createPayment(order._id, req.user._id);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: paymentData.providerOrderId || paymentData.razorpayOrderId,
        providerOrderId: paymentData.providerOrderId,
        internalOrderId: order._id,
        orderNumber: order.orderNumber,
        amount: paymentData.amount,
        currency: paymentData.currency,
        keyId: paymentData.keyId,
        key: paymentData.keyId,
      },
      'Razorpay order created successfully'
    )
  );
});

// 3. Verify Payment (POST /api/payment/verify)
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification payloads');
  }

  const payment = await paymentService.verifyPaymentSignature(req.user._id, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  // Update order status
  if (payment.order) {
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'PAID',
      orderStatus: 'PROCESSING',
      paymentReference: razorpay_payment_id,
      trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
    });
  }

  res.status(200).json(new ApiResponse(200, { payment }, 'Payment verified successfully'));
});

// 4. Get My Orders (GET /api/payment/myorders)
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'title name price images slug'),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Orders retrieved successfully'
    )
  );
});

const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    throw new ApiError(400, 'Missing webhook signature');
  }
  if (!req.rawBody) {
    throw new ApiError(400, 'Raw body missing');
  }
  await paymentService.handleWebhook(req.rawBody, signature);
  res.status(200).json({ status: 'ok' });
});

module.exports = {
  placeCodOrder,
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  handleWebhook,
};
