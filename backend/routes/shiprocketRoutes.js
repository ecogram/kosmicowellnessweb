const express = require('express');
const router = express.Router();
const shiprocketController = require('../controllers/shiprocketController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/estimate-delivery', optionalProtect, shiprocketController.estimateDelivery);
router.post('/create-order', optionalProtect, shiprocketController.createOrder);
router.post('/orders/create', optionalProtect, shiprocketController.createOrder);
router.get('/track/:shipmentId', optionalProtect, shiprocketController.trackShipment);

module.exports = router;

