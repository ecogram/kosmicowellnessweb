const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');

// Public API (No Bearer Token required)
router.get('/subscription-amount', settingsController.getSubscriptionAmount);

// Admin API to update subscription amount
router.post('/subscription-amount', settingsController.updateSubscriptionAmount);
router.put('/subscription-amount', settingsController.updateSubscriptionAmount);

module.exports = router;
