const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', couponController.getCoupons);
router.post('/apply', protect, couponController.applyCoupon);

module.exports = router;
