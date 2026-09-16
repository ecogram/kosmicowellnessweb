const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Documented Orders & Payments Endpoints (Section 8: A, B, C, D)
router.post('/cod', protect, paymentController.placeCodOrder);
router.post('/razorpay/create', protect, paymentController.createRazorpayOrder);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/myorders', protect, paymentController.getMyOrders);

module.exports = router;
