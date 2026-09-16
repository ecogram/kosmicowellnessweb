const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Documented Orders & Payments Endpoints (Section 6)

// 1. Saved Payment Methods
router.get('/saved-methods', protect, paymentController.getSavedPaymentMethods);
router.post('/save-method', protect, paymentController.savePaymentMethod);
router.put('/save-method/:methodId', protect, paymentController.updateSavedPaymentMethod);
router.delete('/save-method/:methodId', protect, paymentController.deleteSavedPaymentMethod);

// 2. COD Orders
router.post('/cod', protect, paymentController.placeCodOrder);

// 3. COD Upfront Payment (Partial COD via Razorpay)
router.post('/cod-upfront/create', protect, paymentController.createCodUpfrontOrder);
router.post('/cod-upfront/verify', protect, paymentController.verifyCodUpfrontPayment);

// 4. Razorpay Orders
router.post('/razorpay/create', protect, paymentController.createRazorpayOrder);
router.post('/razorpay/cancel-pending', protect, paymentController.cancelPendingRazorpayOrder);
router.post('/verify', protect, paymentController.verifyPayment);

// 5. User Orders & Webhook
router.get('/myorders', protect, paymentController.getMyOrders);
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
