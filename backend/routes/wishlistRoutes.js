const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const { z } = require('zod');

const addSchema = {
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
  })
};

router.use(protect); // Authentication required

// Documented Wishlist Endpoints (Section 4)
router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.delete('/remove', wishlistController.removeWishlistFromBody);
router.post('/remove', wishlistController.removeWishlistFromBody); // fallback support
router.delete('/:productId', wishlistController.removeWishlistItem); // REST alias

module.exports = router;
