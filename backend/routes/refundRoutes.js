const express = require('express');
const router = express.Router();
const orderActionController = require('../controllers/orderActionController');
const { protect } = require('../middleware/authMiddleware');

// Documented Refund Endpoints (Section 6)
router.post('/request', protect, orderActionController.requestRefund);
router.post('/initiate', protect, orderActionController.initiateRefund);
router.get('/my-refunds', protect, orderActionController.getMyRefunds);

module.exports = router;
