const express = require('express');
const router = express.Router();
const shiprocketController = require('../controllers/shiprocketController');
const { optionalProtect, protect } = require('../middleware/authMiddleware');

router.post('/estimate-delivery', optionalProtect, shiprocketController.estimateDelivery);
router.post('/create-order', optionalProtect, shiprocketController.createOrderOnShiprocket);
router.get('/order/:orderId', optionalProtect, shiprocketController.checkShiprocketOrder);
router.get('/check-order/:orderId', optionalProtect, shiprocketController.checkShiprocketOrder);

module.exports = router;
