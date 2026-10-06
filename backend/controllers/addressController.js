const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Address = require('../models/Address');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, addresses, 'Addresses fetched successfully'));
});

const addAddress = asyncHandler(async (req, res) => {
  const { addressLabel, fullName, flatBuilding, streetAddress, landmark, areaColony, houseNo, apartment, city, state, pincode, phoneNumber, isDefault } = req.body;

  if (isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  } else {
    // If first address, make it default automatically
    const count = await Address.countDocuments({ user: req.user._id });
    if (count === 0) {
      req.body.isDefault = true;
    }
  }

  const rawFlat = (flatBuilding || houseNo || apartment || '').trim();
  const rawArea = (landmark || areaColony || (rawFlat && streetAddress && rawFlat !== streetAddress ? streetAddress : '') || '').trim();
  const finalFlatBuilding = rawFlat || (streetAddress ? streetAddress.trim() : '');
  const finalAreaColony = rawArea;
  const finalStreetAddress = rawArea || finalFlatBuilding;

  const address = await Address.create({
    user: req.user._id,
    addressLabel: addressLabel || 'Home',
    fullName,
    flatBuilding: finalFlatBuilding,
    streetAddress: finalStreetAddress,
    landmark: finalAreaColony,
    areaColony: finalAreaColony,
    city,
    state: state || '',
    pincode,
    phoneNumber,
    isDefault: req.body.isDefault || false,
  });

  res.status(201).json(new ApiResponse(201, address, 'Address added successfully'));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOne({ _id: addressId, user: req.user._id });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id }, { isDefault: false });
  }

  const { addressLabel, fullName, flatBuilding, streetAddress, landmark, areaColony, houseNo, apartment, city, state, pincode, phoneNumber, isDefault } = req.body;
  
  const rawFlat = (flatBuilding !== undefined ? flatBuilding : (houseNo || apartment || address.flatBuilding || '')).trim();
  const rawArea = (landmark !== undefined ? landmark : (areaColony !== undefined ? areaColony : address.landmark || address.areaColony || '')).trim();
  const finalFlatBuilding = rawFlat || (streetAddress ? streetAddress.trim() : address.flatBuilding);
  const finalAreaColony = rawArea;
  const finalStreetAddress = rawArea || finalFlatBuilding;

  if (addressLabel !== undefined) address.addressLabel = addressLabel;
  if (fullName) address.fullName = fullName;
  address.flatBuilding = finalFlatBuilding;
  address.streetAddress = finalStreetAddress;
  address.landmark = finalAreaColony;
  address.areaColony = finalAreaColony;
  if (city) address.city = city;
  if (state !== undefined) address.state = state;
  if (pincode) address.pincode = pincode;
  if (phoneNumber) address.phoneNumber = phoneNumber;
  if (isDefault !== undefined) address.isDefault = isDefault;

  await address.save();

  res.status(200).json(new ApiResponse(200, address, 'Address updated successfully'));
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOne({ _id: addressId, user: req.user._id });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  await Address.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  res.status(200).json(new ApiResponse(200, address, 'Default address updated successfully'));
});

const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOne({ _id: addressId, user: req.user._id });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  res.status(200).json(new ApiResponse(200, address, 'Address fetched successfully'));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOneAndDelete({ _id: addressId, user: req.user._id });

  if (!address) {
    throw new ApiError(404, 'Address not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully'));
});

module.exports = {
  getAddresses,
  getAddressById,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
