const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Documented Review Endpoint (Section 3: C)
// Mounted to /api/products/:productId/reviews
router.route('/')
  .get(reviewController.getReviews)
  .post(protect, reviewController.createReview);

module.exports = router;
