const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(addressController.getAddresses)
  .post(addressController.addAddress);

router.put('/set-default/:addressId', addressController.setDefaultAddress);
router.put('/:addressId/set-default', addressController.setDefaultAddress);

router.route('/:addressId')
  .get(addressController.getAddressById)
  .put(addressController.updateAddress)
  .delete(addressController.deleteAddress);

module.exports = router;
