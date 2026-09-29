const express = require('express');
const router = express.Router();
const orderActionController = require('../controllers/orderActionController');
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// 1. Razorpay Order Placement: POST /api/order/place/razorpay
router.post('/place/razorpay', protect, paymentController.createRazorpayOrder);

// 2. Verify Razorpay Payment: POST /api/order/razorpay/verify & POST /api/order/verify
router.post('/razorpay/verify', protect, paymentController.verifyPayment);
router.post('/verify', protect, paymentController.verifyPayment);

// 3. Cash on Delivery (COD) Order: POST /api/order/place/cod
router.post('/place/cod', protect, paymentController.placeCodOrder);

// 4. Fetch User's Orders ("My Orders"): GET /api/order/myorders
router.get('/myorders', protect, paymentController.getMyOrders);

// 5. Cancel Pending Razorpay: POST /api/order/razorpay/cancel-pending
router.post('/razorpay/cancel-pending', protect, paymentController.cancelPendingRazorpayOrder);

// Order Actions (Tracking, Cancel, Return)
router.get('/track/:orderId', protect, orderActionController.trackOrder);
router.post('/cancel/:orderId', protect, orderActionController.cancelOrder);
router.post('/return/:orderId', protect, orderActionController.returnOrder);

module.exports = router;

