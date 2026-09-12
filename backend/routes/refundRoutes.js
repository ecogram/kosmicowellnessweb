const express = require('express');
const router = express.Router();
const orderActionController = require('../controllers/orderActionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/initiate', protect, orderActionController.initiateRefund);
router.get('/my-refunds', protect, orderActionController.getMyRefunds);

module.exports = router;
