const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All cart actions require authentication

// 1. Get Cart
router.get('/', cartController.getCart);

// 2. Add to Cart (supports both POST /api/cart and POST /api/cart/add)
router.post('/', cartController.addToCart);
router.post('/add', cartController.addToCart);

// 3. Clear Cart (must precede /:productId)
router.delete('/clear', cartController.clearCart);
router.delete('/', cartController.clearCart);

// 4. Remove Item from Cart (supports DELETE /api/cart/remove/:productId and DELETE /api/cart/:productId)
router.delete('/remove/:productId', cartController.removeCartItem);
router.delete('/:productId', cartController.removeCartItem);

// 5. Update Item Quantity (supports PUT /api/cart/update/:productId and PUT /api/cart/:productId)
router.put('/update/:productId', cartController.updateCartItem);
router.put('/:productId', cartController.updateCartItem);

module.exports = router;
