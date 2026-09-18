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

// 1. Specific Product Catalog Endpoints (User Side)
router.get('/user/list', productController.getProducts);
router.get('/categories', productController.getDistinctCategories);
router.get('/bestsellers', productController.getBestsellers);

// 2. Admin Product Management (/api/products/admin/*)
router.get('/admin/list', productController.getAdminProducts);
router.post('/admin/add-product', handleUpload, productController.addProduct);
router.put('/admin/update-product/:id', handleUpload, productController.updateProduct);
router.put('/admin/toggle-visibility/:id', productController.toggleVisibility);
router.delete('/admin/delete-product/:id', productController.deleteProduct);
router.post('/admin/extract-url', productController.extractProductUrl);

// 3. Product Reviews (GET & POST /products/:productId/reviews or /products/:id/reviews)
router.get('/:productId/reviews', reviewController.getReviews);
router.post('/:productId/reviews', protect, reviewController.createReview);
router.get('/:id/reviews', reviewController.getReviews);
router.post('/:id/reviews', protect, reviewController.createReview);

// 4. Single Product Details & Root
router.get('/:slug', productController.getProductBySlug);
router.get('/:id', productController.getProductBySlug);
router.get('/', productController.getProducts);

// 5. REST write operations
router.post('/', handleUpload, productController.addProduct);
router.put('/:id', handleUpload, productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
