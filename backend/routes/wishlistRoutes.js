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

// Documented Wishlist Endpoints (Section 5: A, B, C)
router.get('/', wishlistController.getWishlist);
router.post('/add', wishlistController.addToWishlist);
router.post('/remove', wishlistController.removeWishlistFromBody);

module.exports = router;
