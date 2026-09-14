const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Public & Customer Routes
router.get('/', couponController.getCoupons);
router.post('/apply', protect, couponController.applyCoupon);

// Admin Coupon Management Routes
router.get('/admin/all', protect, authorizeRoles('admin'), couponController.getAllAdminCoupons);
router.post('/admin', protect, authorizeRoles('admin'), couponController.createCoupon);
router.patch('/admin/:id', protect, authorizeRoles('admin'), couponController.updateCoupon);
router.delete('/admin/:id', protect, authorizeRoles('admin'), couponController.deleteCoupon);

module.exports = router;
