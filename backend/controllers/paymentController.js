const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const paymentService = require('../services/paymentService');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Address = require('../models/Address');
const { sendOrderConfirmationEmail } = require('../utils/email');
const shiprocketService = require('../services/shiprocketService');

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
    let foundAddr = await Address.findOne({ _id: deliveryAddressId, user: req.user._id });
    if (!foundAddr) {
      foundAddr = await Address.findById(deliveryAddressId);
    }
    if (foundAddr) {
      addressData = {
        fullName: foundAddr.fullName,
        phone: foundAddr.phoneNumber,
        flatBuilding: foundAddr.flatBuilding || '',
        addressLine1: foundAddr.flatBuilding ? `${foundAddr.flatBuilding}, ${foundAddr.streetAddress}` : foundAddr.streetAddress,
        streetAddress: foundAddr.streetAddress,
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
    deliveryAddress: addressData,
    billingAddress: addressData,
    orderStatus: 'Placed',
    paymentStatus: 'COD_PENDING',
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

  // Auto-sync COD order with Shiprocket immediately
  try {
    await shiprocketService.createOrder(order);
  } catch (err) {
    console.error('[Shiprocket] Auto-sync failed for COD order:', err.message || err);
  }

  res.status(201).json(new ApiResponse(201, { order }, 'COD Order placed successfully'));
});

// 2. Create Razorpay Order (POST /api/payment/razorpay/create)
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, deliveryAddressId, shippingAddress: directAddress, items, discountAmount = 0, deliveryFee = 0, gstCharge = 0 } = req.body;

  let addressData = directAddress;
  if (!addressData && deliveryAddressId) {
    let foundAddr = await Address.findOne({ _id: deliveryAddressId, user: req.user._id });
    if (!foundAddr) {
      foundAddr = await Address.findById(deliveryAddressId);
    }
    if (foundAddr) {
      addressData = {
        fullName: foundAddr.fullName,
        phone: foundAddr.phoneNumber,
        flatBuilding: foundAddr.flatBuilding || '',
        addressLine1: foundAddr.flatBuilding ? `${foundAddr.flatBuilding}, ${foundAddr.streetAddress}` : foundAddr.streetAddress,
        streetAddress: foundAddr.streetAddress,
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

  const upfrontAmount = Number(req.body.upfrontAmount) || 0;
  const paymentMethod = req.body.paymentMethod || (upfrontAmount > 0 ? 'COD_UPFRONT' : 'ONLINE');
  const finalTotal = req.body.total || amount || Math.max(0, calculatedSubtotal - Number(discountAmount) + Number(deliveryFee) + Number(gstCharge));
  const payableNow = upfrontAmount > 0 ? upfrontAmount : finalTotal;

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
    upfrontAmount: upfrontAmount,
    shippingAddress: addressData,
    deliveryAddress: addressData,
    billingAddress: addressData,
    orderStatus: 'PENDING',
    paymentStatus: 'PENDING',
    paymentMethod: paymentMethod,
  });

  const paymentData = await paymentService.createPayment(order._id, req.user._id, payableNow);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: paymentData.providerOrderId || paymentData.razorpayOrderId,
        providerOrderId: paymentData.providerOrderId,
        internalOrderId: order._id,
        orderNumber: order.orderNumber,
        amount: paymentData.amount,
        upfrontAmount: upfrontAmount,
        currency: paymentData.currency,
        keyId: paymentData.keyId,
        key: paymentData.keyId,
      },
      'Razorpay order created successfully'
    )
  );
});

// 3. Verify Payment (POST /api/payment/razorpay/verify & POST /api/payment/verify)
const verifyPayment = asyncHandler(async (req, res) => {
  const razorpay_order_id =
    req.body.razorpay_order_id ||
    req.body.razorpayOrderId ||
    req.body.orderId ||
    req.body.order_id;
  const razorpay_payment_id =
    req.body.razorpay_payment_id ||
    req.body.razorpayPaymentId ||
    req.body.paymentId ||
    req.body.payment_id;
  const razorpay_signature =
    req.body.razorpay_signature ||
    req.body.razorpaySignature ||
    req.body.signature;

  if (!razorpay_payment_id) {
    throw new ApiError(400, 'Missing payment verification payloads (razorpay_payment_id is required)');
  }

  const payment = await paymentService.verifyPaymentSignature(req.user._id, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  // Update order status
  const orderId = payment.order?._id || payment.order;
  let order = null;
  if (orderId) {
    const existingOrder = await Order.findById(orderId);
    const isCodUpfront =
      existingOrder?.paymentMethod === 'COD_UPFRONT' ||
      existingOrder?.paymentMethod === 'COD' ||
      (existingOrder?.upfrontAmount && existingOrder?.upfrontAmount > 0) ||
      (Number(existingOrder?.total || existingOrder?.amount || 0) >= 104 && Number(existingOrder?.subtotal || 0) <= 10) ||
      Number(existingOrder?.deliveryFee || existingOrder?.shipping || 0) > 0;

    order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentMethod: isCodUpfront ? 'COD_UPFRONT' : (existingOrder?.paymentMethod || 'ONLINE'),
        paymentStatus: isCodUpfront ? 'PARTIAL_PAID' : 'PAID',
        upfrontPaymentStatus: isCodUpfront ? 'Paid' : undefined,
        upfrontAmount: isCodUpfront ? (existingOrder?.upfrontAmount || 104) : 0,
        deliveryFee: isCodUpfront ? (existingOrder?.deliveryFee || 88) : 0,
        shipping: isCodUpfront ? (existingOrder?.shipping || 88) : 0,
        gstCharge: isCodUpfront ? (existingOrder?.gstCharge || 16) : 0,
        tax: isCodUpfront ? (existingOrder?.tax || 16) : 0,
        orderStatus: 'Placed',
        paymentReference: razorpay_payment_id,
        trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
      },
      { new: true }
    );

    // Auto-sync verified paid order with Shiprocket immediately
    try {
      await shiprocketService.createOrder(order || existingOrder);
    } catch (err) {
      console.error('[Shiprocket] Auto-sync failed for verified payment:', err.message || err);
    }
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        payment,
        order: order || payment.order,
        orderId: order?._id || orderId,
        orderNumber: order?.orderNumber,
        status: 'PAID',
        success: true,
      },
      'Payment verified successfully'
    )
  );
});

// 4. Get My Orders (GET /api/payment/myorders)
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : '';
  const userPhone = req.user.phoneNumber || req.user.phone || '';
  const cleanPhone = String(userPhone).replace(/[^0-9]/g, '');

  const userConditions = [
    { user: req.user._id },
    { user: String(req.user._id) },
    { userId: req.user._id },
    { userId: String(req.user._id) },
    ...(userEmail ? [{ userEmail: new RegExp(`^${userEmail}$`, 'i') }] : []),
    ...(cleanPhone.length >= 10 ? [
      { 'shippingAddress.phone': new RegExp(cleanPhone.slice(-10)) },
      { 'shippingAddress.phoneNumber': new RegExp(cleanPhone.slice(-10)) },
      { 'deliveryAddress.phone': new RegExp(cleanPhone.slice(-10)) },
      { 'deliveryAddress.phoneNumber': new RegExp(cleanPhone.slice(-10)) },
    ] : []),
  ];

  const query = {
    $and: [
      { $or: userConditions },
      {
        // Include all placed, paid, COD, partial paid, and active/cancelled user orders
        $or: [
          { paymentStatus: { $regex: /^(paid|partial_paid|completed|cod_pending|refunded)/i } },
          { orderStatus: { $regex: /^(placed|confirmed|processing|shipped|delivered|cancelled|returned|refunded)/i } },
          { upfrontAmount: { $gt: 0 } },
          { paymentMethod: { $regex: /cod/i } },
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
              flatBuilding: foundAddr.flatBuilding || '',
              addressLine1: foundAddr.flatBuilding ? `${foundAddr.flatBuilding}, ${foundAddr.streetAddress}` : foundAddr.streetAddress,
              streetAddress: foundAddr.streetAddress,
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
      const orderSubtotal = o.subtotal !== undefined ? Number(o.subtotal) : orderTotal;
      const orderNum = o.orderNumber || o.shiprocketOrderId || o._id.toString();

      const isCodOrder =
        (o.paymentMethod || '').toUpperCase().includes('COD') ||
        (o.paymentStatus || '').toUpperCase().includes('COD') ||
        (o.paymentStatus || '').toUpperCase() === 'PARTIAL_PAID' ||
        Number(o.upfrontAmount || 0) > 0 ||
        Number(o.deliveryFee || o.shipping || 0) > 0 ||
        (orderTotal >= 104 && orderSubtotal <= 10) ||
        (orderTotal - orderSubtotal >= 80);

      const resolvedDeliveryFee = isCodOrder ? (Number(o.deliveryFee ?? o.shipping ?? 0) || 88) : 0;
      const resolvedGstCharge = isCodOrder ? (Number(o.gstCharge ?? o.tax ?? 0) || 16) : 0;
      const resolvedUpfrontAmount = isCodOrder ? (Number(o.upfrontAmount || 0) || (resolvedDeliveryFee + resolvedGstCharge) || 104) : 0;
      const resolvedPaymentMethod = isCodOrder ? (o.paymentMethod && o.paymentMethod.toUpperCase().includes('COD') ? o.paymentMethod : 'COD_UPFRONT') : (o.paymentMethod || 'ONLINE');
      const resolvedPaidAmount = isCodOrder
        ? resolvedUpfrontAmount
        : (['PAID', 'COMPLETED'].includes(String(o.paymentStatus || '').toUpperCase()) ? orderTotal : 0);
      const resolvedBalanceAmount = isCodOrder
        ? Math.max(0, orderTotal - resolvedUpfrontAmount)
        : (['PAID', 'COMPLETED'].includes(String(o.paymentStatus || '').toUpperCase()) ? 0 : orderTotal);

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
        subtotal: orderSubtotal,
        shipping: resolvedDeliveryFee,
        deliveryFee: resolvedDeliveryFee,
        tax: resolvedGstCharge,
        gstCharge: resolvedGstCharge,
        upfrontAmount: resolvedUpfrontAmount,
        paidAmount: resolvedPaidAmount,
        balanceAmount: resolvedBalanceAmount,
        discount: o.discount !== undefined ? Number(o.discount) : (o.discountAmount !== undefined ? Number(o.discountAmount) : 0),
        discountAmount: o.discountAmount !== undefined ? Number(o.discountAmount) : (o.discount !== undefined ? Number(o.discount) : 0),
        orderStatus: String(o.orderStatus || 'PROCESSING').toUpperCase(),
        paymentStatus: isCodOrder && ['PAID', 'COMPLETED'].includes(String(o.paymentStatus || '').toUpperCase()) ? 'PARTIAL_PAID' : String(o.paymentStatus || 'PENDING').toUpperCase(),
        paymentMethod: resolvedPaymentMethod,
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
    let foundAddr = await Address.findOne({ _id: deliveryAddressId, user: req.user._id });
    if (!foundAddr) {
      foundAddr = await Address.findById(deliveryAddressId);
    }
    if (foundAddr) {
      addressData = {
        fullName: foundAddr.fullName,
        phone: foundAddr.phoneNumber,
        flatBuilding: foundAddr.flatBuilding || '',
        addressLine1: foundAddr.flatBuilding ? `${foundAddr.flatBuilding}, ${foundAddr.streetAddress}` : foundAddr.streetAddress,
        streetAddress: foundAddr.streetAddress,
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

  const finalTotal = Number(req.body.total) || amount || Math.max(0, calculatedSubtotal - Number(discountAmount) + Number(deliveryFee) + Number(gstCharge));
  const payableUpfront = Math.min(Number(upfrontAmount) || 104, finalTotal);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    userName: req.user.name || (addressData && addressData.fullName) || 'Customer',
    userEmail: req.user.email ? req.user.email.toLowerCase().trim() : '',
    items: formattedItems,
    subtotal: calculatedSubtotal || finalTotal,
    discount: Number(discountAmount) || 0,
    shipping: Number(deliveryFee) || 88,
    deliveryFee: Number(deliveryFee) || 88,
    tax: Number(gstCharge) || 16,
    gstCharge: Number(gstCharge) || 16,
    total: finalTotal,
    amount: finalTotal,
    upfrontAmount: payableUpfront,
    shippingAddress: addressData,
    deliveryAddress: addressData,
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
        paidAmount: payableUpfront,
        remainingCodAmount: Math.max(0, finalTotal - payableUpfront),
        balanceAmount: Math.max(0, finalTotal - payableUpfront),
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
  const razorpay_order_id =
    req.body.razorpay_order_id ||
    req.body.razorpayOrderId ||
    req.body.orderId ||
    req.body.order_id;
  const razorpay_payment_id =
    req.body.razorpay_payment_id ||
    req.body.razorpayPaymentId ||
    req.body.paymentId ||
    req.body.payment_id;
  const razorpay_signature =
    req.body.razorpay_signature ||
    req.body.razorpaySignature ||
    req.body.signature;

  if (!razorpay_payment_id) {
    throw new ApiError(400, 'Missing payment verification payloads (razorpay_payment_id is required)');
  }
  const payment = await paymentService.verifyPaymentSignature(req.user._id, {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });

  let updatedOrder = null;
  if (payment.order) {
    const existingOrder = await Order.findById(payment.order);
    const resolvedUpfront = Number(existingOrder?.upfrontAmount || 104);
    const orderTotal = Number(existingOrder?.total || existingOrder?.amount || 0);

    updatedOrder = await Order.findByIdAndUpdate(
      payment.order,
      {
        paymentMethod: 'COD_UPFRONT',
        paymentStatus: 'PARTIAL_PAID',
        upfrontPaymentStatus: 'Paid',
        orderStatus: 'Placed',
        upfrontAmount: resolvedUpfront,
        deliveryFee: Number(existingOrder?.deliveryFee || 88),
        shipping: Number(existingOrder?.shipping || 88),
        gstCharge: Number(existingOrder?.gstCharge || 16),
        tax: Number(existingOrder?.tax || 16),
        paymentReference: razorpay_payment_id,
        trackingNumber: 'TRK-' + Math.floor(10000000 + Math.random() * 90000000),
      },
      { new: true }
    );

    try {
      if (updatedOrder && (updatedOrder.userEmail || req.user.email)) {
        await sendOrderConfirmationEmail(updatedOrder, updatedOrder.userEmail || req.user.email);
      }
    } catch (err) {
      console.error('COD Upfront confirmation email error:', err);
    }

    // Auto-sync upfront COD order with Shiprocket immediately
    try {
      await shiprocketService.createOrder(updatedOrder);
    } catch (err) {
      console.error('[Shiprocket] Auto-sync failed for COD Upfront order:', err.message || err);
    }
  }

  const resOrder = updatedOrder ? {
    ...(updatedOrder.toObject ? updatedOrder.toObject() : updatedOrder),
    paidAmount: Number(updatedOrder.upfrontAmount || 104),
    balanceAmount: Math.max(0, Number(updatedOrder.total || updatedOrder.amount || 0) - Number(updatedOrder.upfrontAmount || 104)),
  } : null;

  res.status(200).json(new ApiResponse(200, { payment, order: resOrder }, 'COD Upfront payment verified successfully'));
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

  const query = baseQuery;

  const order = await Order.findOne(query).lean();
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const orderTotal = order.total !== undefined ? Number(order.total) : (order.amount !== undefined ? Number(order.amount) : 0);
  const orderSubtotal = order.subtotal !== undefined ? Number(order.subtotal) : orderTotal;
  const isCodOrder =
    (order.paymentMethod || '').toUpperCase().includes('COD') ||
    (order.paymentStatus || '').toUpperCase().includes('COD') ||
    (order.paymentStatus || '').toUpperCase() === 'PARTIAL_PAID' ||
    Number(order.upfrontAmount || 0) > 0 ||
    Number(order.deliveryFee || order.shipping || 0) > 0 ||
    (orderTotal >= 104 && orderSubtotal <= 10) ||
    (orderTotal - orderSubtotal >= 80);

  const resolvedDeliveryFee = isCodOrder ? (Number(order.deliveryFee ?? order.shipping ?? 0) || 88) : 0;
  const resolvedGstCharge = isCodOrder ? (Number(order.gstCharge ?? order.tax ?? 0) || 16) : 0;
  const resolvedUpfrontAmount = isCodOrder ? (Number(order.upfrontAmount || 0) || (resolvedDeliveryFee + resolvedGstCharge) || 104) : 0;
  const resolvedPaidAmount = isCodOrder
    ? resolvedUpfrontAmount
    : (['PAID', 'COMPLETED'].includes(String(order.paymentStatus || '').toUpperCase()) ? orderTotal : 0);
  const resolvedBalanceAmount = isCodOrder
    ? Math.max(0, orderTotal - resolvedUpfrontAmount)
    : (['PAID', 'COMPLETED'].includes(String(order.paymentStatus || '').toUpperCase()) ? 0 : orderTotal);

  const formattedOrder = {
    ...order,
    total: orderTotal,
    amount: orderTotal,
    subtotal: orderSubtotal,
    deliveryFee: resolvedDeliveryFee,
    shipping: resolvedDeliveryFee,
    gstCharge: resolvedGstCharge,
    tax: resolvedGstCharge,
    upfrontAmount: resolvedUpfrontAmount,
    paidAmount: resolvedPaidAmount,
    balanceAmount: resolvedBalanceAmount,
    paymentMethod: isCodOrder ? (order.paymentMethod && order.paymentMethod.toUpperCase().includes('COD') ? order.paymentMethod : 'COD_UPFRONT') : (order.paymentMethod || 'ONLINE'),
    paymentStatus: isCodOrder && ['PAID', 'COMPLETED'].includes(String(order.paymentStatus || '').toUpperCase()) ? 'PARTIAL_PAID' : (order.paymentStatus || 'PENDING'),
  };

  res.status(200).json(new ApiResponse(200, { order: formattedOrder }, 'Order retrieved successfully'));
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

  // Process SavedPaymentMethod collection (strictly UPI only)
  collectionMethods.forEach((m) => {
    const upiId = (m.upiId || '').trim();
    if (!upiId) return; // Skip non-UPI methods
    const idStr = m._id.toString();
    const key = upiId.toLowerCase();
    map.set(key, {
      _id: idStr,
      id: idStr,
      type: 'UPI',
      displayName: m.title || m.displayName || 'UPI Account',
      upiId: upiId,
      isDefault: !!m.isDefault,
    });
  });

  // Process User.savedPaymentMethods array (strictly UPI only)
  userMethods.forEach((m) => {
    const upiId = (m.upiId || '').trim();
    if (!upiId) return; // Skip non-UPI methods
    const idStr = (m._id || m.id || '').toString();
    const key = upiId.toLowerCase();
    if (!map.has(key)) {
      map.set(key, {
        _id: idStr,
        id: idStr,
        type: 'UPI',
        displayName: m.displayName || m.title || 'UPI Account',
        upiId: upiId,
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
  const { displayName, title, upiId, isDefault } = req.body;

  if (!upiId || !upiId.trim()) {
    throw new ApiError(400, 'UPI ID is required');
  }

  const cleanUpi = upiId.trim();
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const finalTitle = displayName || title || user.name || 'UPI Account';

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
    type: 'UPI',
    displayName: finalTitle,
    upiId: cleanUpi,
    isDefault: !!isDefault || user.savedPaymentMethods.length === 0,
  };

  user.savedPaymentMethods.unshift(newMethod);
  await user.save();

  try {
    await SavedPaymentMethod.create({
      user: req.user._id,
      methodType: 'UPI',
      title: finalTitle,
      upiId: cleanUpi,
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
  const mongoose = require('mongoose');
  const methodId = req.params.methodId || req.params.id;
  const cleanId = decodeURIComponent(methodId).trim().toLowerCase();
  const user = await User.findById(req.user._id);

  if (user && user.savedPaymentMethods) {
    if (req.body.isDefault) {
      user.savedPaymentMethods.forEach((m) => {
        m.isDefault = false;
      });
      if (req.body.upiId) {
        user.upiId = req.body.upiId;
      }
    }
    const method = user.savedPaymentMethods.find((m) => {
      const mId = (m._id ? m._id.toString() : (m.id || '')).trim().toLowerCase();
      const mUpi = (m.upiId || '').trim().toLowerCase();
      return mId === cleanId || mUpi === cleanId || mId === methodId || mUpi === methodId;
    });
    if (method) {
      Object.assign(method, req.body);
    }
    await user.save();
  }

  try {
    if (req.body.isDefault) {
      await SavedPaymentMethod.updateMany({ user: req.user._id }, { isDefault: false });
    }
    if (mongoose.Types.ObjectId.isValid(methodId)) {
      await SavedPaymentMethod.findOneAndUpdate(
        { _id: methodId, user: req.user._id },
        req.body,
        { new: true }
      );
    }
    await SavedPaymentMethod.updateMany(
      {
        user: req.user._id,
        $or: [{ upiId: methodId }, { upiId: cleanId }],
      },
      req.body
    );
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

  res.status(200).json(new ApiResponse(200, { methods: combined, paymentMethods: combined }, 'Payment method updated successfully'));
});

const deleteSavedPaymentMethod = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const SavedPaymentMethod = require('../models/SavedPaymentMethod');
  const mongoose = require('mongoose');
  const methodId = req.params.methodId || req.params.id;
  const cleanId = decodeURIComponent(methodId).trim().toLowerCase();
  const user = await User.findById(req.user._id);

  if (user) {
    if (user.savedPaymentMethods && Array.isArray(user.savedPaymentMethods)) {
      user.savedPaymentMethods = user.savedPaymentMethods.filter((m) => {
        const mId = (m._id ? m._id.toString() : (m.id || '')).trim().toLowerCase();
        const mUpi = (m.upiId || '').trim().toLowerCase();
        return mId !== cleanId && mUpi !== cleanId && mId !== methodId && mUpi !== methodId;
      });
    }
    if (
      (user.upiId || '').trim().toLowerCase() === cleanId ||
      cleanId === 'user_upi' ||
      !user.savedPaymentMethods ||
      user.savedPaymentMethods.length === 0
    ) {
      user.upiId = '';
    }
    await user.save();
  }

  try {
    if (mongoose.Types.ObjectId.isValid(methodId)) {
      await SavedPaymentMethod.findOneAndDelete({ _id: methodId, user: req.user._id });
    }
    await SavedPaymentMethod.deleteMany({
      user: req.user._id,
      $or: [{ upiId: methodId }, { upiId: cleanId }, { title: methodId }],
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
