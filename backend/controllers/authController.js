const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const authService = require('../services/authService');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const sendOtp = asyncHandler(async (req, res) => {
  const { email, type } = req.body;
  const result = await authService.sendEmailOtp(email, type || 'auto');
  res.status(200).json(new ApiResponse(200, result, 'Verification code sent to your email'));
});

const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, name, type } = req.body;
  const { user, accessToken, refreshToken } = await authService.verifyEmailOtp(email, otp, name, req.ip, type || 'auto');

  res.cookie('jwt', refreshToken, cookieOptions);

  res.status(200).json(new ApiResponse(200, { user, accessToken, token: accessToken }, 'Authenticated successfully'));
});

// Document Aligned Auth Endpoints:
const register = asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  if (!name || name.trim().length < 2) {
    throw new ApiError(400, 'Please enter your full name');
  }
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    throw new ApiError(400, 'Name should only contain alphabets (no numbers or special characters allowed)');
  }
  const result = await authService.sendEmailOtp(email, 'register');
  res.status(200).json(new ApiResponse(200, { ...result, name: name.trim() }, 'Registration OTP sent successfully'));
});

const signupVerify = asyncHandler(async (req, res) => {
  const { email, otp, name } = req.body;
  if (name && !/^[a-zA-Z\s]+$/.test(name.trim())) {
    throw new ApiError(400, 'Name should only contain alphabets (no numbers or special characters allowed)');
  }
  const { user, accessToken, refreshToken } = await authService.verifyEmailOtp(email, otp, name ? name.trim() : undefined, req.ip, 'register');

  res.cookie('jwt', refreshToken, cookieOptions);
  res.status(200).json(new ApiResponse(200, { user, token: accessToken, accessToken }, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.sendEmailOtp(email, 'login');
  res.status(200).json(new ApiResponse(200, result, 'Login OTP sent successfully'));
});

const loginVerify = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const { user, accessToken, refreshToken } = await authService.verifyEmailOtp(email, otp, undefined, req.ip, 'login');

  res.cookie('jwt', refreshToken, cookieOptions);
  res.status(200).json(new ApiResponse(200, { user, token: accessToken, accessToken }, 'Logged in successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
  let profilePicture = req.body.profilePicture || req.body.profileImage || req.body.avatar;

  if (file) {
    profilePicture = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
  }

  const { name, fullName, phoneNumber, phone, removePhoto } = req.body;
  const user = await authService.updateProfile(req.user._id, {
    name,
    fullName,
    phoneNumber,
    phone,
    profilePicture,
    profileImage: profilePicture,
    avatar: profilePicture,
    removePhoto: removePhoto === true || removePhoto === 'true',
  });
  res.status(200).json(new ApiResponse(200, { user, ...user }, 'Profile updated successfully'));
});

const removeProfilePicture = asyncHandler(async (req, res) => {
  const user = await authService.removeProfilePicture(req.user._id);
  res.status(200).json(new ApiResponse(200, { user, ...user }, 'Profile picture removed successfully'));
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.jwt;

  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token provided');
  }

  const { accessToken, refreshToken: newRefreshToken } = await authService.refreshAuthToken(refreshToken, req.ip);

  res.cookie('jwt', newRefreshToken, cookieOptions);

  res.status(200).json(new ApiResponse(200, { accessToken }, 'Token refreshed'));
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.jwt;
  if (refreshToken) {
    await authService.logoutUser(refreshToken);
  }

  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

const getMe = asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const dbUser = await User.findById(req.user._id).select('-passwordHash');
  const u = dbUser || req.user;

  const pic = u.profilePicture || u.profileImage || u.avatar || '';
  const userPhone = u.phoneNumber || u.phone || '';

  const user = {
    id: u._id,
    _id: u._id,
    name: u.name,
    fullName: u.name,
    email: u.email,
    role: u.role,
    phoneNumber: userPhone,
    phone: userPhone,
    mobile: userPhone,
    profilePicture: pic,
    profileImage: pic,
    avatar: pic,
    avatarUrl: pic,
    image: pic,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
  res.status(200).json(new ApiResponse(200, { user, ...user }, 'User data retrieved'));
});

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  signupVerify,
  login,
  loginVerify,
  updateProfile,
  removeProfilePicture,
  refresh,
  logout,
  getMe,
};
