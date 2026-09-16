const express = require('express');
const router = express.Router();
const orderActionController = require('../controllers/orderActionController');
const { protect } = require('../middleware/authMiddleware');

// Documented Return & Replacement Endpoints (Section 7)
router.post('/initiate', protect, orderActionController.initiateReturn);
router.get('/my-returns', protect, orderActionController.getMyReturns);

module.exports = router;
