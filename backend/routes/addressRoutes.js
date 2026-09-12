const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(addressController.getAddresses)
  .post(addressController.addAddress);

router.put('/set-default/:addressId', addressController.setDefaultAddress);

router.route('/:addressId')
  .put(addressController.updateAddress)
  .delete(addressController.deleteAddress);

module.exports = router;
