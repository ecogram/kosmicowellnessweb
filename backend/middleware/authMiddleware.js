const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../utils/apiResponse');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'Kosmico_Secret_Key_123';
    const decoded = jwt.verify(token, secret);
    
    // Load user without passwordHash
    req.user = await User.findById(decoded.id).select('-passwordHash');
    
    if (!req.user || !req.user.isActive) {
      return next(new ApiError(401, 'User no longer exists or is inactive'));
    }
    
    next();
  } catch (error) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }
});

const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'Kosmico_Secret_Key_123';
    const decoded = jwt.verify(token, secret);
    req.user = await User.findById(decoded.id).select('-passwordHash');
  } catch (error) {
    // Silent catch for optional auth
  }
  next();
});

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, `User role ${req.user?.role} is not authorized to access this route`));
    }
    next();
  };
};

module.exports = { protect, optionalProtect, authorizeRoles };
