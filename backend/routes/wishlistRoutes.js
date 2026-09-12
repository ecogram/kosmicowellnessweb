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

router.route('/')
  .get(wishlistController.getWishlist)
  .delete(wishlistController.clearWishlist);

router.post('/add', wishlistController.addToWishlist);
router.post('/remove', wishlistController.removeWishlistFromBody);

router.route('/items')
  .post(validate(addSchema), wishlistController.addToWishlist);

router.route('/items/:productId')
  .delete(wishlistController.removeWishlistItem);

module.exports = router;
