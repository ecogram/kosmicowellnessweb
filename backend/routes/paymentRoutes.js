const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Document-specific routes
router.post('/cod', protect, paymentController.placeCodOrder);
router.post('/razorpay/create', protect, paymentController.createRazorpayOrder);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/myorders', protect, paymentController.getMyOrders);

// Existing endpoints
router.post('/create', protect, paymentController.createRazorpayOrder);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
