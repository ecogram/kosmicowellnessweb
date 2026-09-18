const express = require('express');
const router = express.Router();
const orderActionController = require('../controllers/orderActionController');
const { protect } = require('../middleware/authMiddleware');

// Documented Return Endpoints (Section 6)
router.post('/request', protect, orderActionController.requestReturn);
router.post('/initiate', protect, orderActionController.initiateReturn);
router.get('/my-returns', protect, orderActionController.getMyReturns);

module.exports = router;
