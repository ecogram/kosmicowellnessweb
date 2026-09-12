const express = require('express');
const router = express.Router();
const orderActionController = require('../controllers/orderActionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/track/:orderId', protect, orderActionController.trackOrder);
router.post('/cancel/:orderId', protect, orderActionController.cancelOrder);
router.post('/return/:orderId', protect, orderActionController.returnOrder);

module.exports = router;
