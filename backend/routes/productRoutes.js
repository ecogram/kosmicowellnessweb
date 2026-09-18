const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const handleUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
};

// 1. User Catalog Endpoints
router.get('/user/list', productController.getProducts);
router.get('/categories', productController.getDistinctCategories);
router.get('/bestsellers', productController.getBestsellers);

// 2. Product Reviews (User Facing)
router.get('/:productId/reviews', reviewController.getReviews);
router.post('/:productId/reviews', protect, reviewController.createReview);
router.get('/:id/reviews', reviewController.getReviews);
router.post('/:id/reviews', protect, reviewController.createReview);

// 3. Single Product Details & Root (User Facing)
router.get('/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductBySlug);
router.get('/', productController.getProducts);

module.exports = router;
