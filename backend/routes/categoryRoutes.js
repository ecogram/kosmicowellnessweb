const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Documented Categories Catalog Endpoint (Section 3: B)
router.get('/user/list', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

module.exports = router;
