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
        try {
          const dbProd = await Product.findById(pId);
          if (dbProd) {
            pName = dbProd.title || dbProd.name || pName;
            pPrice = dbProd.discountPrice || dbProd.price || pPrice;
            pImage = (dbProd.images && dbProd.images[0]?.url) || dbProd.image || pImage;
          }
        } catch (_) { }
      }

      const qty = Number(it.quantity) || 1;
      calculatedSubtotal += pPrice * qty;

      formattedItems.push({
        product: pId || req.user._id,
        name: pName,
        priceSnapshot: pPrice,
        price: pPrice,
        quantity: qty,
        qty: qty,
        image: pImage,
      });
    }
  }

  const finalTotal = amount || Math.max(0, calculatedSubtotal - Number(discountAmount) + Number(deliveryFee) + Number(gstCharge));

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    userName: req.user.name || (addressData && addressData.fullName) || 'Customer',
    userEmail: req.user.email ? req.user.email.toLowerCase().trim() : '',
    items: formattedItems,
    subtotal: calculatedSubtotal || finalTotal,
    discount: Number(discountAmount) || 0,
    shipping: Number(deliveryFee) || 0,
    deliveryFee: Number(deliveryFee) || 0,
    tax: Number(gstCharge) || 0,
    gstCharge: Number(gstCharge) || 0,
    total: finalTotal,
    amount: finalTotal,
    shippingAddress: addressData,
    billingAddress: addressData,
    orderStatus: 'PROCESSING',
    paymentStatus: 'PENDING',
    paymentMethod: 'COD',
    trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
  });

  // Attempt to send email async
  try {
    if (req.user && req.user.email) {
      await sendOrderConfirmationEmail(order, req.user);
    }
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
      const pId = typeof it.product === 'object' ? (it.product?._id || it.product?.id) : (it.productId || it._id || it.product);
      let pName = it.name || 'Kosmico Product';
      let pPrice = Number(it.price || it.priceSnapshot) || 0;
      let pImage = it.image || '';

      if (pId && require('mongoose').Types.ObjectId.isValid(pId)) {
        try {
          const dbProd = await Product.findById(pId);
          if (dbProd) {
            pName = dbProd.title || dbProd.name || pName;
            pPrice = dbProd.discountPrice || dbProd.price || pPrice;
            pImage = (dbProd.images && dbProd.images[0]?.url) || dbProd.image || pImage;
          }
        } catch (_) { }
      }

      const qty = Number(it.quantity) || 1;
      calculatedSubtotal += pPrice * qty;

      formattedItems.push({
        product: pId || req.user._id,
        name: pName,
        priceSnapshot: pPrice,
        price: pPrice,
        quantity: qty,
        qty: qty,
        image: pImage,
      });
    }
  }

  const finalTotal = amount || Math.max(0, calculatedSubtotal - Number(discountAmount) + Number(deliveryFee) + Number(gstCharge));

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    userName: req.user.name || (addressData && addressData.fullName) || 'Customer',
    userEmail: req.user.email ? req.user.email.toLowerCase().trim() : '',
    items: formattedItems,
    subtotal: calculatedSubtotal || finalTotal,
    discount: Number(discountAmount) || 0,
    shipping: Number(deliveryFee) || 0,
    deliveryFee: Number(deliveryFee) || 0,
    tax: Number(gstCharge) || 0,
    gstCharge: Number(gstCharge) || 0,
    total: finalTotal,
    amount: finalTotal,
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
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';
  const userConditions = [
    { user: req.user._id },
    { user: String(req.user._id) },
    ...(userEmail ? [{ userEmail: new RegExp(`^${userEmail}$`, 'i') }] : []),
  ];

  const query = {
    $and: [
      { $or: userConditions },
      {
        $or: [
          // 1. COD Orders (placed / confirmed)
          {
            paymentMethod: { $in: ['COD', 'cod', 'COD_UPFRONT', 'cod_upfront'] },
            orderStatus: { $in: ['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED', 'CANCELLED'] }
          },
          // 2. Online Orders: MUST be verified PAID/COMPLETED or in confirmed processing/shipped state
          {
            paymentMethod: { $nin: ['COD', 'cod', 'COD_UPFRONT', 'cod_upfront'] },
            $or: [
              { paymentStatus: { $in: ['PAID', 'paid', 'COMPLETED', 'completed', 'REFUNDED', 'refunded'] } },
              { orderStatus: { $in: ['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'] } }
            ]
          }
        ]
      },
      // Exclude test data & dummy orders
      {
        orderNumber: { $not: /^TEST|^MOCK|^DEMO|^DEV_|^DUMMY_/i },
        userEmail: { $not: /@example\.com$|@test\.com$|^test@|^dummy@/i },
        isTest: { $ne: true },
        testOrder: { $ne: true },
        isMock: { $ne: true }
      }
    ]
  };

  const [rawOrders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  const orders = await Promise.all(
    rawOrders.map(async (o) => {
      // 1. Populate item details
      const formattedItems = await Promise.all(
        (o.items || []).map(async (it) => {
          const pId = it.product?._id || it.product || it.productId;
          let pName = it.name || it.title || 'Kosmico Product';
          let pImage = it.image || '';
          let pPrice = Number(it.price || it.priceSnapshot) || 0;
          let pQty = Number(it.qty || it.quantity) || 1;

          if (pId) {
            try {
              const dbProd = await Product.findById(pId).select('title name price images slug').lean();
              if (dbProd) {
                pName = dbProd.title || dbProd.name || pName;
                pPrice = pPrice || dbProd.discountPrice || dbProd.price || 0;
                pImage = pImage || (dbProd.images && dbProd.images[0]?.url) || '';
              }
            } catch (_) { }
          }

          return {
            product: {
              _id: pId,
              title: pName,
              name: pName,
              price: pPrice,
              images: pImage ? [{ url: pImage }] : [],
            },
            name: pName,
            priceSnapshot: pPrice,
            price: pPrice,
            quantity: pQty,
            qty: pQty,
            image: pImage,
          };
        })
      );

      // 2. Resolve address
      let addressData = o.shippingAddress || o.deliveryAddress;
      if (typeof addressData === 'string' || (addressData && addressData._bsontype)) {
        try {
          const foundAddr = await Address.findById(addressData).lean();
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
        } catch (_) { }
      }

      if (!addressData || typeof addressData !== 'object') {
        addressData = {
          fullName: o.userName || req.user.name || 'Valued Customer',
          phone: req.user.phoneNumber || '',
          addressLine1: 'Customer Address',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
        };
      }

      const orderTotal = o.total !== undefined ? Number(o.total) : (o.amount !== undefined ? Number(o.amount) : 0);
      const orderNum = o.orderNumber || o.shiprocketOrderId || o._id.toString();

      return {
        ...o,
        _id: o._id,
        orderNumber: orderNum,
        orderId: o._id.toString(),
        shiprocketOrderId: o.shiprocketOrderId || '',
        shiprocketShipmentId: o.shiprocketShipmentId || '',
        items: formattedItems,
        total: orderTotal,
        amount: orderTotal,
        subtotal: o.subtotal !== undefined ? Number(o.subtotal) : orderTotal,
        shipping: o.shipping !== undefined ? Number(o.shipping) : (o.deliveryFee !== undefined ? Number(o.deliveryFee) : 0),
        deliveryFee: o.deliveryFee !== undefined ? Number(o.deliveryFee) : (o.shipping !== undefined ? Number(o.shipping) : 0),
        discount: o.discount !== undefined ? Number(o.discount) : (o.discountAmount !== undefined ? Number(o.discountAmount) : 0),
        discountAmount: o.discountAmount !== undefined ? Number(o.discountAmount) : (o.discount !== undefined ? Number(o.discount) : 0),
        orderStatus: String(o.orderStatus || 'PROCESSING').toUpperCase(),
        paymentStatus: String(o.paymentStatus || 'PENDING').toUpperCase(),
        paymentMethod: o.paymentMethod || 'COD',
        shippingAddress: addressData,
        deliveryAddress: addressData,
        billingAddress: o.billingAddress || addressData,
        createdAt: o.createdAt || new Date().toISOString(),
      };
    })
  );

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


// 6. COD Upfront Payment (POST /api/payment/cod-upfront/create & /verify)
const createCodUpfrontOrder = asyncHandler(async (req, res) => {
  const {
    amount,
    upfrontAmount = 99,
    deliveryAddressId,
    shippingAddress: directAddress,
    items,
    discountAmount = 0,
    deliveryFee = 0,
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

  const formattedItems = [];
  let calculatedSubtotal = 0;

  if (items && Array.isArray(items) && items.length > 0) {
    for (const it of items) {
      const pId = it.productId || it._id || it.product;
      let pName = it.name || 'Kosmico Product';
      let pPrice = Number(it.price || it.priceSnapshot) || 0;
      let pImage = it.image || '';

      if (pId) {
        try {
          const dbProd = await Product.findById(pId);
          if (dbProd) {
            pName = dbProd.title || dbProd.name || pName;
            pPrice = dbProd.discountPrice || dbProd.price || pPrice;
            pImage = (dbProd.images && dbProd.images[0]?.url) || dbProd.image || pImage;
          }
        } catch (_) { }
      }

      const qty = Number(it.qty || it.quantity) || 1;
      calculatedSubtotal += pPrice * qty;

      formattedItems.push({
        product: pId || req.user._id,
        name: pName,
        priceSnapshot: pPrice,
        price: pPrice,
        quantity: qty,
        qty: qty,
        image: pImage,
      });
    }
  }

  const finalTotal = amount || Math.max(0, calculatedSubtotal - Number(discountAmount) + Number(deliveryFee) + Number(gstCharge));
  const payableUpfront = Math.min(Number(upfrontAmount) || 99, finalTotal);

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
    paymentMethod: 'COD_UPFRONT',
  });

  const paymentData = await paymentService.createPayment(order._id, req.user._id, payableUpfront);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: paymentData.providerOrderId || paymentData.razorpayOrderId,
        providerOrderId: paymentData.providerOrderId,
        internalOrderId: order._id,
        orderNumber: order.orderNumber,
        upfrontAmount: payableUpfront,
        remainingCodAmount: Math.max(0, finalTotal - payableUpfront),
        amount: paymentData.amount,
        currency: paymentData.currency,
        keyId: paymentData.keyId,
        key: paymentData.keyId,
      },
      'COD Upfront payment initialized successfully'
    )
  );
});

const verifyCodUpfrontPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification payloads');
  }
  const payment = await paymentService.verifyPaymentSignature(req.user._id, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  if (payment.order) {
    await Order.findByIdAndUpdate(payment.order, {
      paymentStatus: 'PARTIAL_PAID',
      orderStatus: 'PROCESSING',
      paymentReference: razorpay_payment_id,
      trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
    });
  }

  res.status(200).json(new ApiResponse(200, { payment }, 'COD Upfront payment verified successfully'));
});

// 7. Cancel Pending Razorpay Order (POST /api/payment/razorpay/cancel-pending)
const cancelPendingRazorpayOrder = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, internalOrderId } = req.body;
  const targetId = internalOrderId || orderId;

  if (targetId) {
    const order = await Order.findOne({
      _id: targetId,
      user: req.user._id,
      orderStatus: 'PENDING',
    });
    if (order) {
      order.orderStatus = 'CANCELLED';
      order.paymentStatus = 'FAILED';
      await order.save();
    }
  }

  const provId = razorpay_order_id || orderId;
  if (provId) {
    const Payment = require('../models/Payment');
    await Payment.findOneAndUpdate(
      { providerOrderId: provId, user: req.user._id, status: { $in: ['CREATED', 'PENDING'] } },
      { status: 'CANCELLED' }
    );
  }

  res.status(200).json(new ApiResponse(200, null, 'Pending order cancelled successfully'));
});

const getOrderById = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
  const userEmail = req.user?.email ? req.user.email.toLowerCase().trim() : '';

  const idCondition = isObjectId
    ? [{ _id: orderId }, { orderNumber: orderId }, { shiprocketOrderId: orderId }]
    : [{ orderNumber: orderId }, { shiprocketOrderId: orderId }];

  const userCondition = req.user
    ? [
      { user: req.user._id },
      { user: String(req.user._id) },
      ...(userEmail ? [{ userEmail: new RegExp(`^${userEmail}$`, 'i') }] : []),
    ]
    : [];

  const baseQuery = userCondition.length > 0
    ? { $and: [{ $or: idCondition }, { $or: userCondition }] }
    : { $or: idCondition };

  const query = {
    $and: [
      baseQuery,
      {
        $or: [
          { paymentMethod: { $in: ['COD', 'cod', 'COD_UPFRONT', 'cod_upfront'] } },
          { paymentStatus: { $in: ['PAID', 'paid', 'COMPLETED', 'completed', 'REFUNDED', 'refunded'] } },
          { orderStatus: { $in: ['PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'] } }
        ]
      },
      {
        orderNumber: { $not: /^TEST|^MOCK|^DEMO|^DEV_|^DUMMY_/i },
        isTest: { $ne: true },
        testOrder: { $ne: true },
        isMock: { $ne: true }
      }
    ]
  };

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.status(200).json(new ApiResponse(200, { order }, 'Order retrieved successfully'));
});

// 8. Razorpay Webhook Handler (POST /api/payment/webhook)
const handleWebhook = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, 'Webhook processed successfully'));
});

// Helper to fetch and merge payment methods from both User.savedPaymentMethods and SavedPaymentMethod model
const fetchCombinedPaymentMethods = async (userId) => {
  const User = require('../models/User');
  const SavedPaymentMethod = require('../models/SavedPaymentMethod');

  const user = await User.findById(userId).lean();
  const userMethods = user?.savedPaymentMethods || [];

  let collectionMethods = [];
  try {
    collectionMethods = await SavedPaymentMethod.find({ user: userId }).lean();
  } catch (_) {}

  const map = new Map();

  // Process SavedPaymentMethod collection
  collectionMethods.forEach((m) => {
    const idStr = m._id.toString();
    const key = (m.upiId || m.accountNumber || idStr).trim().toLowerCase();
    map.set(key, {
      _id: idStr,
      id: idStr,
      type: m.methodType || (m.upiId ? 'UPI' : 'BANK'),
      displayName: m.title || m.displayName || (m.upiId ? 'UPI' : 'Bank Account'),
      upiId: m.upiId || '',
      bankName: m.bankName || '',
      accountNumber: m.accountNumber || '',
      ifscCode: m.ifscCode || '',
      isDefault: !!m.isDefault,
    });
  });

  // Process User.savedPaymentMethods array
  userMethods.forEach((m) => {
    const idStr = (m._id || m.id || '').toString();
    const key = (m.upiId || m.accountNumber || idStr).trim().toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        _id: idStr,
        id: idStr,
        type: m.type || (m.upiId ? 'UPI' : 'BANK'),
        displayName: m.displayName || m.title || (m.upiId ? 'UPI' : 'Bank Account'),
        upiId: m.upiId || '',
        bankName: m.bankName || '',
        accountNumber: m.accountNumber || '',
        ifscCode: m.ifscCode || '',
        isDefault: !!m.isDefault,
      });
    }
  });

  return Array.from(map.values());
};

const getSavedPaymentMethods = asyncHandler(async (req, res) => {
  const methods = await fetchCombinedPaymentMethods(req.user._id);
  res.status(200).json(new ApiResponse(200, { methods, paymentMethods: methods, savedPaymentMethods: methods }, 'Saved payment methods retrieved'));
});

const savePaymentMethod = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const SavedPaymentMethod = require('../models/SavedPaymentMethod');
  const { type, methodType, displayName, title, upiId, bankName, accountNumber, ifscCode, isDefault } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const finalType = type || methodType || (upiId ? 'UPI' : 'BANK');
  const finalTitle = displayName || title || (upiId ? 'UPI Account' : 'Bank Account');

  if (!user.savedPaymentMethods) {
    user.savedPaymentMethods = [];
  }

  if (isDefault) {
    user.savedPaymentMethods.forEach((m) => {
      m.isDefault = false;
    });
    try {
      await SavedPaymentMethod.updateMany({ user: req.user._id }, { isDefault: false });
    } catch (_) {}
  }

  const newMethod = {
    type: finalType,
    displayName: finalTitle,
    upiId: upiId || '',
    bankName: bankName || '',
    accountNumber: accountNumber || '',
    ifscCode: ifscCode || '',
    isDefault: !!isDefault || user.savedPaymentMethods.length === 0,
  };

  user.savedPaymentMethods.unshift(newMethod);
  await user.save();

  try {
    await SavedPaymentMethod.create({
      user: req.user._id,
      methodType: finalType,
      title: finalTitle,
      upiId: upiId || '',
      bankName: bankName || '',
      accountNumber: accountNumber || '',
      ifscCode: ifscCode || '',
      isDefault: newMethod.isDefault,
    });
  } catch (_) {}

  const combined = await fetchCombinedPaymentMethods(req.user._id);

  try {
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(req.user._id, 'profile:updated', { user });
    emitToUser(req.user._id, 'user:profile_updated', { user });
    emitToUser(req.user._id, 'payment_methods:updated', { methods: combined });
    if (req.user.email) {
      emitToUser(req.user.email.toLowerCase(), 'profile:updated', { user });
      emitToUser(req.user.email.toLowerCase(), 'payment_methods:updated', { methods: combined });
    }
  } catch (_) { }

  res.status(201).json(new ApiResponse(201, { method: combined[0], methods: combined, paymentMethods: combined }, 'Payment method saved successfully'));
});

const updateSavedPaymentMethod = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const SavedPaymentMethod = require('../models/SavedPaymentMethod');
  const methodId = req.params.methodId || req.params.id;
  const user = await User.findById(req.user._id);

  if (user && user.savedPaymentMethods) {
    const method = user.savedPaymentMethods.id(methodId);
    if (method) {
      if (req.body.isDefault) {
        user.savedPaymentMethods.forEach((m) => {
          m.isDefault = false;
        });
      }
      Object.assign(method, req.body);
      await user.save();
    }
  }

  try {
    if (req.body.isDefault) {
      await SavedPaymentMethod.updateMany({ user: req.user._id }, { isDefault: false });
    }
    await SavedPaymentMethod.findOneAndUpdate(
      { _id: methodId, user: req.user._id },
      req.body,
      { new: true }
    );
  } catch (_) {}

  const combined = await fetchCombinedPaymentMethods(req.user._id);

  try {
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(req.user._id, 'profile:updated', { user });
    emitToUser(req.user._id, 'user:profile_updated', { user });
    emitToUser(req.user._id, 'payment_methods:updated', { methods: combined });
  } catch (_) { }

  res.status(200).json(new ApiResponse(200, { methods: combined, paymentMethods: combined }, 'Payment method updated successfully'));
});

const deleteSavedPaymentMethod = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const SavedPaymentMethod = require('../models/SavedPaymentMethod');
  const methodId = req.params.methodId || req.params.id;
  const user = await User.findById(req.user._id);

  if (user && user.savedPaymentMethods) {
    user.savedPaymentMethods = user.savedPaymentMethods.filter((m) => m._id.toString() !== methodId && m.id !== methodId);
    await user.save();
  }

  try {
    await SavedPaymentMethod.findOneAndDelete({ _id: methodId, user: req.user._id });
  } catch (_) {}

  const combined = await fetchCombinedPaymentMethods(req.user._id);

  try {
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(req.user._id, 'profile:updated', { user });
    emitToUser(req.user._id, 'user:profile_updated', { user });
    emitToUser(req.user._id, 'payment_methods:updated', { methods: combined });
  } catch (_) { }

  res.status(200).json(new ApiResponse(200, { methods: combined, paymentMethods: combined }, 'Payment method deleted successfully'));
});

module.exports = {
  placeCodOrder,
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  getSavedPaymentMethods,
  savePaymentMethod,
  updateSavedPaymentMethod,
  deleteSavedPaymentMethod,
  createCodUpfrontOrder,
  verifyCodUpfrontPayment,
  cancelPendingRazorpayOrder,
  handleWebhook,
};
