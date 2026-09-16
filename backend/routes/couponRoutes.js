const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public & Customer Routes (Doc API #16 & #17)
router.get('/', couponController.getCoupons);
router.post('/apply', protect, couponController.applyCoupon);

module.exports = router;
