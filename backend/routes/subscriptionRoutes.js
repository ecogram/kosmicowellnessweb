const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

// All subscription routes require authentication
router.use(protect);

router.post('/create-order', subscriptionController.createSubscriptionOrder);
router.post('/verify', subscriptionController.verifySubscriptionPayment);
router.get('/status', subscriptionController.getSubscriptionStatus);
router.post('/use-trial', subscriptionController.useTrial);

module.exports = router;
