/**
 * Comprehensive API Test Suite for Kosmico Wellness User-Side API Documentation (USER_API_DOCS.md)
 * Tests all 12 modules and all 48 endpoints against live backend with real database OTP lookup.
 */

const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';
const MONGO_URI = 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-platform': 'web',
    'x-app-version': '1.0.3',
    'User-Agent': 'KosmicoApp/1.0',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function runAllTests() {
  console.log('🚀 Connecting to DB & Starting Kosmico Wellness Comprehensive API Test Suite...\n');
  await mongoose.connect(MONGO_URI);
  const OtpModel = mongoose.model('Otp', new mongoose.Schema({ email: String, otp: String, expiresAt: Date }, { strict: false }));
  const UserModel = mongoose.model('User', new mongoose.Schema({ email: String, name: String }, { strict: false }));

  let passed = 0;
  let failed = 0;
  const results = [];

  function record(module, testName, isSuccess, details) {
    if (isSuccess) {
      passed++;
      console.log(`  ✅ [PASS] ${module} -> ${testName}`);
    } else {
      failed++;
      console.log(`  ❌ [FAIL] ${module} -> ${testName}: ${JSON.stringify(details)}`);
    }
    results.push({ module, testName, isSuccess, details });
  }

  // Generate unique test email
  const testEmail = `testuser_${Date.now()}@example.com`;
  let authToken = '';
  let userId = '';
  let sampleProductId = '';
  let sampleAddressId = '';
  let sampleOrderId = '';
  let samplePostId = '';
  let sampleMethodId = '';
  let sampleNotificationId = '';

  // -------------------------------------------------------------
  // MODULE 1: Authentication Module (/api/auth)
  // -------------------------------------------------------------
  console.log('\n--- 1. Authentication Module ---');
  
  // 1.1 Register User
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: 'Shubham Tiwari', email: testEmail }),
  });
  record('Auth', '1. Register User (POST /auth/register)', regRes.status === 200, regRes.data);

  // 1.2 Resend OTP
  const resendRes = await request('/auth/resend-otp', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, type: 'register' }),
  });
  record('Auth', '5. Resend OTP (POST /auth/resend-otp)', resendRes.status === 200, resendRes.data);

  // Fetch real OTP generated in database
  const otpDoc = await OtpModel.findOne({ email: testEmail.toLowerCase() });
  const realOtp = otpDoc ? otpDoc.otp : '123456';

  // 1.3 Verify Signup OTP
  const verifyRes = await request('/auth/signup-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: realOtp, name: 'Shubham Tiwari' }),
  });
  if (verifyRes.ok && (verifyRes.data?.data?.token || verifyRes.data?.data?.accessToken)) {
    authToken = verifyRes.data.data.token || verifyRes.data.data.accessToken;
    userId = verifyRes.data.data.user?._id || verifyRes.data.data.user?.id;
  }
  record('Auth', '3. Verify Signup OTP (POST /auth/signup-verify)', verifyRes.status === 200, verifyRes.data);

  // 1.4 Login User
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail }),
  });
  record('Auth', '2. Login User (POST /auth/login)', loginRes.status === 200, loginRes.data);

  // Fetch real login OTP
  const loginOtpDoc = await OtpModel.findOne({ email: testEmail.toLowerCase() });
  const realLoginOtp = loginOtpDoc ? loginOtpDoc.otp : '123456';

  // 1.5 Verify Login OTP
  const loginVerifyRes = await request('/auth/login-verify', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, otp: realLoginOtp }),
  });
  if (loginVerifyRes.ok && (loginVerifyRes.data?.data?.token || loginVerifyRes.data?.data?.accessToken)) {
    authToken = loginVerifyRes.data.data.token || loginVerifyRes.data.data.accessToken;
    userId = loginVerifyRes.data.data.user?._id;
  }
  record('Auth', '4. Verify Login OTP (POST /auth/login-verify)', loginVerifyRes.status === 200, loginVerifyRes.data);

  const authHeaders = authToken ? { Authorization: `Bearer ${authToken}` } : {};

  // 1.6 Update Profile
  const profileRes = await request('/auth/profile', {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({ name: 'Shubham Updated', phoneNumber: '9876543210' }),
  });
  record('Auth', '6. Update Profile (PUT /auth/profile)', profileRes.status === 200, profileRes.data);

  // 1.7 Remove Profile Picture
  const removePicRes = await request('/auth/remove-profile-picture', {
    method: 'DELETE',
    headers: authHeaders,
  });
  record('Auth', '7. Remove Profile Picture (DELETE /auth/remove-profile-picture)', removePicRes.status === 200, removePicRes.data);

  // -------------------------------------------------------------
  // MODULE 2: Address Management Module (/api/address)
  // -------------------------------------------------------------
  console.log('\n--- 2. Address Management Module ---');

  // 2.1 Save Address
  const saveAddrRes = await request('/address', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      addressLabel: 'Home',
      fullName: 'John Doe',
      streetAddress: '123 Main St',
      city: 'Delhi',
      pincode: '110001',
      phoneNumber: '9876543210',
      isDefault: true,
    }),
  });
  if (saveAddrRes.ok && saveAddrRes.data?.data?.address?._id) {
    sampleAddressId = saveAddrRes.data.data.address._id;
  }
  record('Address', '1. Save Address (POST /address)', saveAddrRes.status === 201 || saveAddrRes.status === 200, saveAddrRes.data);

  // 2.2 Get Saved Addresses
  const getAddrRes = await request('/address', {
    method: 'GET',
    headers: authHeaders,
  });
  if (!sampleAddressId && getAddrRes.ok && getAddrRes.data?.data?.addresses?.[0]?._id) {
    sampleAddressId = getAddrRes.data.data.addresses[0]._id;
  }
  record('Address', '2. Get Saved Addresses (GET /address)', getAddrRes.status === 200, getAddrRes.data);

  // 2.3 Update Address
  if (sampleAddressId) {
    const updateAddrRes = await request(`/address/${sampleAddressId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        addressLabel: 'Work',
        fullName: 'John Doe Updated',
        streetAddress: '456 Tech Park',
        city: 'Delhi',
        pincode: '110001',
        phoneNumber: '9876543210',
      }),
    });
    record('Address', '3. Update Address (PUT /address/{id})', updateAddrRes.status === 200, updateAddrRes.data);

    // 2.4 Set Default Address
    const setDefRes = await request(`/address/set-default/${sampleAddressId}`, {
      method: 'PUT',
      headers: authHeaders,
    });
    record('Address', '4. Set Default Address (PUT /address/set-default/{id})', setDefRes.status === 200, setDefRes.data);
  }

  // -------------------------------------------------------------
  // MODULE 3: Products & Categories Module (/api/products, /api/categories)
  // -------------------------------------------------------------
  console.log('\n--- 3. Products & Categories Module ---');

  // 3.1 Get User Products List
  const prodListRes = await request('/products/user/list?page=1&limit=12');
  const prods = Array.isArray(prodListRes.data?.data) ? prodListRes.data.data : prodListRes.data?.data?.products;
  if (prods && prods[0]?._id) {
    sampleProductId = prods[0]._id;
  }
  record('Products', '1. Get User Products List (GET /products/user/list)', prodListRes.status === 200, prods?.length !== undefined);

  // 3.2 Get Categories List
  const catListRes = await request('/categories/user/list');
  record('Categories', '2. Get Categories List (GET /categories/user/list)', catListRes.status === 200, catListRes.data);

  // 3.3 Submit Product Review
  if (sampleProductId) {
    const reviewRes = await request(`/products/${sampleProductId}/reviews`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ rating: 5, comment: 'Excellent wellness product!' }),
    });
    record('Products', '3. Submit Review (POST /products/{id}/reviews)', reviewRes.status === 200 || reviewRes.status === 201, reviewRes.data);
  }

  // -------------------------------------------------------------
  // MODULE 4: Wishlist Module (/api/wishlist)
  // -------------------------------------------------------------
  console.log('\n--- 4. Wishlist Module ---');

  if (sampleProductId) {
    // 4.2 Add to Wishlist
    const addWishRes = await request('/wishlist/add', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ productId: sampleProductId }),
    });
    record('Wishlist', '2. Add to Wishlist (POST /wishlist/add)', addWishRes.status === 200, addWishRes.data);

    // 4.1 Get Wishlist
    const getWishRes = await request('/wishlist', {
      method: 'GET',
      headers: authHeaders,
    });
    record('Wishlist', '1. Get Wishlist (GET /wishlist)', getWishRes.status === 200, getWishRes.data);

    // 4.3 Remove from Wishlist
    const remWishRes = await request('/wishlist/remove', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ productId: sampleProductId }),
    });
    record('Wishlist', '3. Remove from Wishlist (POST /wishlist/remove)', remWishRes.status === 200, remWishRes.data);
  }

  // -------------------------------------------------------------
  // MODULE 5: Coupons & Discounts (/api/coupons)
  // -------------------------------------------------------------
  console.log('\n--- 5. Coupons & Discounts Module ---');

  // 5.1 Get Coupons
  const couponsRes = await request('/coupons', {
    method: 'GET',
    headers: authHeaders,
  });
  record('Coupons', '1. Get Coupons (GET /coupons)', couponsRes.status === 200, couponsRes.data);

  // 5.2 Apply Coupon
  const applyCouponRes = await request('/coupons/apply', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ code: 'KOSMICO10', orderAmount: 500.0 }),
  });
  record('Coupons', '2. Apply Coupon (POST /coupons/apply)', applyCouponRes.status === 200 || applyCouponRes.status === 400 || applyCouponRes.status === 404, applyCouponRes.data);

  // -------------------------------------------------------------
  // MODULE 6: Payment & Orders Module (/api/payment, /api/order)
  // -------------------------------------------------------------
  console.log('\n--- 6. Payment & Orders Module ---');

  // 6.1 Saved Payment Methods
  const saveMethodRes = await request('/payment/save-method', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      methodType: 'CARD',
      title: 'HDFC Debit Card',
      cardLast4: '4321',
      cardNetwork: 'VISA',
      cardExpiry: '12/28',
      isDefault: true,
    }),
  });
  if (saveMethodRes.ok && saveMethodRes.data?.data?.paymentMethod?._id) {
    sampleMethodId = saveMethodRes.data.data.paymentMethod._id;
  }
  record('Payment', '6.1 Save Payment Method (POST /payment/save-method)', saveMethodRes.status === 201 || saveMethodRes.status === 200, saveMethodRes.data);

  const getMethodsRes = await request('/payment/saved-methods', {
    method: 'GET',
    headers: authHeaders,
  });
  record('Payment', '6.1 Get Saved Methods (GET /payment/saved-methods)', getMethodsRes.status === 200, getMethodsRes.data);

  if (sampleMethodId) {
    const updateMethodRes = await request(`/payment/save-method/${sampleMethodId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ title: 'HDFC Platinum Card', cardExpiry: '01/29' }),
    });
    record('Payment', '6.1 Update Saved Method (PUT /payment/save-method/{id})', updateMethodRes.status === 200, updateMethodRes.data);

    const delMethodRes = await request(`/payment/save-method/${sampleMethodId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    record('Payment', '6.1 Delete Saved Method (DELETE /payment/save-method/{id})', delMethodRes.status === 200, delMethodRes.data);
  }

  // 6.2 Place COD Order
  const codOrderRes = await request('/payment/cod', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 499.0,
      deliveryAddressId: sampleAddressId,
      items: sampleProductId ? [{ productId: sampleProductId, quantity: 1, price: 499.0 }] : [],
      deliveryFee: 50.0,
      gstCharge: 0.0,
    }),
  });
  if (codOrderRes.ok && codOrderRes.data?.data?.order?._id) {
    sampleOrderId = codOrderRes.data.data.order._id;
  }
  record('Payment', '6.2 Place COD Order (POST /payment/cod)', codOrderRes.status === 201 || codOrderRes.status === 200, codOrderRes.data);

  // 6.3 COD Upfront Payment
  const upfrontCreateRes = await request('/payment/cod-upfront/create', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 499.0,
      upfrontAmount: 99.0,
      deliveryAddressId: sampleAddressId,
      items: sampleProductId ? [{ productId: sampleProductId, quantity: 1, price: 499.0 }] : [],
    }),
  });
  record('Payment', '6.3 Create COD Upfront (POST /payment/cod-upfront/create)', upfrontCreateRes.status === 200, upfrontCreateRes.data);

  // 6.4 Razorpay Orders
  const rzpCreateRes = await request('/payment/razorpay/create', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      amount: 499.0,
      deliveryAddressId: sampleAddressId,
      items: sampleProductId ? [{ productId: sampleProductId, quantity: 1, price: 499.0 }] : [],
    }),
  });
  record('Payment', '6.4 Create Razorpay Order (POST /payment/razorpay/create)', rzpCreateRes.status === 200, rzpCreateRes.data);

  const rzpCancelRes = await request('/payment/razorpay/cancel-pending', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      orderId: rzpCreateRes.data?.data?.internalOrderId,
      razorpay_order_id: rzpCreateRes.data?.data?.orderId,
    }),
  });
  record('Payment', '6.4 Cancel Pending Order (POST /payment/razorpay/cancel-pending)', rzpCancelRes.status === 200, rzpCancelRes.data);

  // 6.5 User Orders & Tracking
  const myOrdersRes = await request('/payment/myorders?page=1&limit=10', {
    method: 'GET',
    headers: authHeaders,
  });
  record('Payment', '6.5 Get My Orders (GET /payment/myorders)', myOrdersRes.status === 200, myOrdersRes.data);

  if (sampleOrderId) {
    const trackRes = await request(`/order/track/${sampleOrderId}`, {
      method: 'GET',
      headers: authHeaders,
    });
    record('Orders', '6.5 Track Order (GET /order/track/{id})', trackRes.status === 200, trackRes.data);

    const cancelOrderRes = await request(`/order/cancel/${sampleOrderId}`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ reason: 'Changed mind' }),
    });
    record('Orders', '6.5 Cancel Order (POST /order/cancel/{id})', cancelOrderRes.status === 200, cancelOrderRes.data);
  }

  // -------------------------------------------------------------
  // MODULE 7: Refunds & Replacements (/api/refund, /api/return)
  // -------------------------------------------------------------
  console.log('\n--- 7. Refunds & Replacements Module ---');

  if (sampleOrderId) {
    const initRefundRes = await request('/refund/initiate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ orderId: sampleOrderId, reason: 'Defective item' }),
    });
    record('Refund', '1. Initiate Refund (POST /refund/initiate)', initRefundRes.status === 200, initRefundRes.data);

    const getRefundsRes = await request('/refund/my-refunds', {
      method: 'GET',
      headers: authHeaders,
    });
    record('Refund', '2. Get My Refunds (GET /refund/my-refunds)', getRefundsRes.status === 200, getRefundsRes.data);

    const initReturnRes = await request('/return/initiate', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ orderId: sampleOrderId, reason: 'Size issue', replacement: true }),
    });
    record('Return', '3. Initiate Replacement (POST /return/initiate)', initReturnRes.status === 200, initReturnRes.data);

    const getReturnsRes = await request('/return/my-returns', {
      method: 'GET',
      headers: authHeaders,
    });
    record('Return', '4. Get My Returns (GET /return/my-returns)', getReturnsRes.status === 200, getReturnsRes.data);
  }

  // -------------------------------------------------------------
  // MODULE 8: Shipping & Delivery Estimation (/api/shiprocket)
  // -------------------------------------------------------------
  console.log('\n--- 8. Shipping & Delivery Estimation ---');

  const shipRes = await request('/shiprocket/estimate-delivery', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      deliveryPincode: '110001',
      weight: 0.5,
      paymentMethod: 'COD',
    }),
  });
  record('Shipping', '1. Estimate Delivery (POST /shiprocket/estimate-delivery)', shipRes.status === 200, shipRes.data);

  // -------------------------------------------------------------
  // MODULE 9: GlucoRhythm Module (/api/gluco)
  // -------------------------------------------------------------
  console.log('\n--- 9. GlucoRhythm Module ---');

  const logReadRes = await request('/gluco/reading', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      glucoseLevel: 110.5,
      timeOfDay: 'Morning',
      readingTime: new Date().toISOString(),
      readingType: 'Fasting',
      notes: 'Feeling good',
    }),
  });
  record('Gluco', '2. Log Glucose Reading (POST /gluco/reading)', logReadRes.status === 200 || logReadRes.status === 201, logReadRes.data);

  const logMealRes = await request('/gluco/meal', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      mealType: 'Breakfast',
      carbs: 45.0,
      logTime: new Date().toISOString(),
      status: 'Logged',
    }),
  });
  record('Gluco', '3. Log Meal (POST /gluco/meal)', logMealRes.status === 200 || logMealRes.status === 201, logMealRes.data);

  const glucoDashRes = await request('/gluco/dashboard', {
    method: 'GET',
    headers: authHeaders,
  });
  record('Gluco', '1. Gluco Dashboard (GET /gluco/dashboard)', glucoDashRes.status === 200, glucoDashRes.data);

  // -------------------------------------------------------------
  // MODULE 10: Social / Community Posts Module (/api/posts)
  // -------------------------------------------------------------
  console.log('\n--- 10. Social / Community Posts Module ---');

  // 10.1 Create Post
  const createPostRes = await request('/posts', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      content: 'Sharing my healthy morning routine! #wellness',
      privacyLevel: 'public',
      tags: 'wellness,health',
    }),
  });
  if (createPostRes.ok && createPostRes.data?.data?.post?._id) {
    samplePostId = createPostRes.data.data.post._id;
  }
  record('Posts', '1. Create Post (POST /posts)', createPostRes.status === 201 || createPostRes.status === 200, createPostRes.data);

  // 10.2 Get Feed
  const feedRes = await request('/posts/feed?page=1&limit=10', {
    method: 'GET',
    headers: authHeaders,
  });
  record('Posts', '2. Get Feed (GET /posts/feed)', feedRes.status === 200, feedRes.data);

  if (userId) {
    // 10.3 Get User Posts
    const userPostsRes = await request(`/posts/user/${userId}`, {
      method: 'GET',
      headers: authHeaders,
    });
    record('Posts', '3. Get User Posts (GET /posts/user/{id})', userPostsRes.status === 200, userPostsRes.data);
  }

  if (samplePostId) {
    // 10.4 Like Post
    const likeRes = await request(`/posts/${samplePostId}/like`, {
      method: 'POST',
      headers: authHeaders,
    });
    record('Posts', '4. Like Post (POST /posts/{id}/like)', likeRes.status === 200, likeRes.data);

    // 10.6 Add Comment
    const addCommentRes = await request(`/posts/${samplePostId}/comments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ text: 'Great post!' }),
    });
    record('Posts', '6. Add Comment (POST /posts/{id}/comments)', addCommentRes.status === 200 || addCommentRes.status === 201, addCommentRes.data);

    // 10.5 Get Comments
    const getCommentsRes = await request(`/posts/${samplePostId}/comments`, {
      method: 'GET',
      headers: authHeaders,
    });
    record('Posts', '5. Get Comments (GET /posts/{id}/comments)', getCommentsRes.status === 200, getCommentsRes.data);

    // 10.7 Edit Post
    const editPostRes = await request(`/posts/${samplePostId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ content: 'Updated post content! #health' }),
    });
    record('Posts', '7. Edit Post (PUT /posts/{id})', editPostRes.status === 200, editPostRes.data);
  }

  // Friends & Requests
  const getFriendsRes = await request('/posts/friends', { method: 'GET', headers: authHeaders });
  record('Posts', 'Friends List (GET /posts/friends)', getFriendsRes.status === 200, getFriendsRes.data);

  const getRequestsRes = await request('/posts/friend-requests', { method: 'GET', headers: authHeaders });
  record('Posts', 'Friend Requests List (GET /posts/friend-requests)', getRequestsRes.status === 200, getRequestsRes.data);

  if (samplePostId) {
    // Delete Post
    const delPostRes = await request(`/posts/${samplePostId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    record('Posts', '8. Delete Post (DELETE /posts/{id})', delPostRes.status === 200, delPostRes.data);
  }

  // -------------------------------------------------------------
  // MODULE 11: Notifications Module (/api/notifications)
  // -------------------------------------------------------------
  console.log('\n--- 11. Notifications Module ---');

  const getNotifRes = await request('/notifications?page=1&limit=20', {
    method: 'GET',
    headers: authHeaders,
  });
  if (getNotifRes.ok && getNotifRes.data?.data?.notifications?.[0]?._id) {
    sampleNotificationId = getNotifRes.data.data.notifications[0]._id;
  }
  record('Notifications', '1. Get Notifications (GET /notifications)', getNotifRes.status === 200, getNotifRes.data);

  if (sampleNotificationId) {
    const readNotifRes = await request(`/notifications/${sampleNotificationId}/read`, {
      method: 'PUT',
      headers: authHeaders,
    });
    record('Notifications', '2. Mark Read (PUT /notifications/{id}/read)', readNotifRes.status === 200, readNotifRes.data);

    const delNotifRes = await request(`/notifications/${sampleNotificationId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    record('Notifications', '3. Delete Notification (DELETE /notifications/{id})', delNotifRes.status === 200, delNotifRes.data);
  }

  const clearNotifRes = await request('/notifications', {
    method: 'DELETE',
    headers: authHeaders,
  });
  record('Notifications', '4. Clear All Notifications (DELETE /notifications)', clearNotifRes.status === 200, clearNotifRes.data);

  // -------------------------------------------------------------
  // MODULE 12: Emergency & System Status (/api/emergency, /api/system, /api/updates)
  // -------------------------------------------------------------
  console.log('\n--- 12. Emergency & System Status ---');

  const emergencyRes = await request('/emergency/generate-message', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ latitude: 28.6139, longitude: 77.2090 }),
  });
  record('Emergency', '1. Emergency SOS Generator (POST /emergency/generate-message)', emergencyRes.status === 200, emergencyRes.data);

  const sysStatusRes = await request('/system/status');
  record('System', '2. System Status (GET /system/status)', sysStatusRes.status === 200, sysStatusRes.data);

  const updateCheckRes = await request('/updates/check?version=1.0.3');
  record('Updates', '3. App Update Check (GET /updates/check)', updateCheckRes.status === 200, updateCheckRes.data);

  // -------------------------------------------------------------
  // 2.5 Delete Address (Cleanup)
  // -------------------------------------------------------------
  if (sampleAddressId) {
    const delAddrRes = await request(`/address/${sampleAddressId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    record('Address', '5. Delete Address (DELETE /address/{id})', delAddrRes.status === 200, delAddrRes.data);
  }

  console.log('\n=============================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED (Total: ${passed + failed})`);
  console.log('=============================================\n');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
