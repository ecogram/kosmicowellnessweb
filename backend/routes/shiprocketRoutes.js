const express = require('express');
const router = express.Router();
const shiprocketController = require('../controllers/shiprocketController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/estimate-delivery', optionalProtect, shiprocketController.estimateDelivery);

module.exports = router;
