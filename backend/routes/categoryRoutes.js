const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// 1. GET /categories/ & GET /categories/user/list
router.get('/user/list', categoryController.getCategories);
router.get('/', categoryController.getCategories);

// 2. GET /categories/:slug
router.get('/:slug', categoryController.getCategoryBySlug);

// 3. Admin routes
router.post('/admin/add-category', categoryController.createCategory);
router.delete('/admin/delete-category/:id', categoryController.deleteCategory);

module.exports = router;
