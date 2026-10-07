const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// All subscription routes require user authentication
router.use(protect);

// 1. Create Subscription Order (POST /api/subscription/create-order)
router.post('/create-order', subscriptionController.createSubscriptionOrder);

// 2. Verify Subscription Payment (POST /api/subscription/verify)
router.post('/verify', subscriptionController.verifySubscriptionPayment);

// 3. Check Subscription Status & Validity (GET /api/subscription/status)
router.get('/status', subscriptionController.getSubscriptionStatus);

// 4. Consume Trial Feature (POST /api/subscription/trial/consume & /trial)
router.post('/trial/consume', subscriptionController.consumeTrial);
router.post('/trial', subscriptionController.consumeTrial);
router.post('/use-trial', subscriptionController.consumeTrial);

module.exports = router;
