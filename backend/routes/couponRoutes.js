const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

// Customer & Public Coupon Routes (Doc API #16 & #17)
router.get('/', couponController.getCoupons);
router.post('/verify', optionalProtect, couponController.applyCoupon);
router.post('/apply', optionalProtect, couponController.applyCoupon);

module.exports = router;
