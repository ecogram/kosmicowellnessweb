const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Documented Product Catalog Endpoint (Section 3: A)
router.get('/user/list', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
