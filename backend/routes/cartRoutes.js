const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// All cart routes require user authentication
router.use(protect);

router.route('/')
  .get(cartController.getCart)
  .post(cartController.addToCart)
  .delete(cartController.clearCart);

router.route('/:productId')
  .put(cartController.updateCartItem)
  .delete(cartController.removeCartItem);

module.exports = router;
