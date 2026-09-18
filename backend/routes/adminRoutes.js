const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const adminOrderController = require('../controllers/adminOrderController');
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

// 2. Product Management (/api/admin/products/*)
router.get('/products/list', productController.getAdminProducts);
router.post('/products/add-product', handleUpload, productController.addProduct);
router.put('/products/update-product/:id', handleUpload, productController.updateProduct);
router.put('/products/toggle-visibility/:id', productController.toggleVisibility);
router.delete('/products/delete-product/:id', productController.deleteProduct);
router.post('/products/extract-url', productController.extractProductUrl);

// 3. Order & Returns Management (/api/admin/*)
router.put('/orders/:id/status', adminOrderController.updateOrderStatus);
router.put('/order/:id/status', adminOrderController.updateOrderStatus);
router.put('/return/:id/status', adminOrderController.updateReturnStatus);
router.put('/refund/:id/status', adminOrderController.updateRefundStatus);

module.exports = router;
