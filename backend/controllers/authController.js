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
  const { email, phoneNumber, phone, name } = req.body;
  if (!name || name.trim().length < 2) {
    throw new ApiError(400, 'Please enter your full name');
  }
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name.trim())) {
    throw new ApiError(400, 'Name should only contain alphabets (no numbers or special characters allowed)');
  }
  const phoneToUse = phoneNumber || phone;
  if (!email && !phoneToUse) {
    throw new ApiError(400, 'Please provide an email or phone number');
  }
  const result = await authService.sendOtp({
    email,
    phoneNumber: phoneToUse,
    type: 'register',
    name: name.trim(),
  });
  res.status(200).json(new ApiResponse(200, { ...result, name: name.trim() }, result.message || 'Registration OTP sent successfully'));
});

const signupVerify = asyncHandler(async (req, res) => {
  const { email, phoneNumber, phone, otp, name } = req.body;
  if (name && !/^[a-zA-Z\s]+$/.test(name.trim())) {
    throw new ApiError(400, 'Name should only contain alphabets (no numbers or special characters allowed)');
  }
  const phoneToUse = phoneNumber || phone;
  if (!email && !phoneToUse) {
    throw new ApiError(400, 'Please provide an email or phone number');
  }
  const { user, accessToken, refreshToken } = await authService.verifyOtp({
    email,
    phoneNumber: phoneToUse,
    otp,
    name: name ? name.trim() : undefined,
    ip: req.ip,
    type: 'register',
  });

  res.cookie('jwt', refreshToken, cookieOptions);

  const responsePayload = {
    _id: user._id || user.id,
    name: user.name,
    email: user.email || '',
    phoneNumber: user.phoneNumber || user.phone || '',
    profilePicture: user.profilePicture || '',
    message: 'Account created successfully! Please login.',
    token: accessToken,
    accessToken,
    user,
  };

  res.status(201).json(new ApiResponse(201, responsePayload, 'Account created successfully! Please login.'));
});

const login = asyncHandler(async (req, res) => {
  const { email, phoneNumber, phone } = req.body;
  const phoneToUse = phoneNumber || phone;
  if (!email && !phoneToUse) {
    throw new ApiError(400, 'Please provide an email or phone number');
  }
  const result = await authService.sendOtp({
    email,
    phoneNumber: phoneToUse,
    type: 'login',
  });
  res.status(200).json(new ApiResponse(200, result, result.message || 'Login OTP sent successfully'));
});

const loginVerify = asyncHandler(async (req, res) => {
  const { email, phoneNumber, phone, otp } = req.body;
  const phoneToUse = phoneNumber || phone;
  if (!email && !phoneToUse) {
    throw new ApiError(400, 'Please provide an email or phone number');
  }
  const { user, accessToken, refreshToken } = await authService.verifyOtp({
    email,
    phoneNumber: phoneToUse,
    otp,
    ip: req.ip,
    type: 'login',
  });

  res.cookie('jwt', refreshToken, cookieOptions);

  const responsePayload = {
    _id: user._id || user.id,
    name: user.name,
    email: user.email || '',
    phoneNumber: user.phoneNumber || user.phone || '',
    token: accessToken,
    accessToken,
    message: 'Login successful!',
    user,
  };

  res.status(200).json(new ApiResponse(200, responsePayload, 'Login successful!'));
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email, phoneNumber, phone, type, purpose } = req.body;
  const phoneToUse = phoneNumber || phone;
  if (!email && !phoneToUse) {
    throw new ApiError(400, 'Email or phone number is required');
  }
  const result = await authService.sendOtp({
    email,
    phoneNumber: phoneToUse,
    type: purpose || type || 'resend',
  });
  res.status(200).json(new ApiResponse(200, result, result.message || 'OTP resent successfully'));
});

const { saveProfileImage } = require('../utils/profileStorage');

const updateProfile = asyncHandler(async (req, res) => {
  const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
  let rawPic =
    req.body.profilePicture ||
    req.body.profileImage ||
    req.body.avatar ||
    req.body.image ||
    req.body.photo ||
    req.body.avatarUrl ||
    req.body.imageUrl ||
    req.body.picture ||
    req.body.profile_picture ||
    req.body.profile_photo;

  let profilePicture = undefined;
  if (file) {
    profilePicture = await saveProfileImage(file.buffer || file, req.user._id, req);
  } else if (rawPic && typeof rawPic === 'string' && rawPic.trim().length > 0) {
    profilePicture = await saveProfileImage(rawPic, req.user._id, req);
  }

  const { name, fullName, phoneNumber, phone, email, removePhoto } = req.body;
  const isRemove = removePhoto === true || removePhoto === 'true';

  const user = await authService.updateProfile(req.user._id, {
    name,
    fullName,
    phoneNumber,
    phone,
    email,
    ...(profilePicture !== undefined ? { profilePicture, profileImage: profilePicture, avatar: profilePicture } : {}),
    removePhoto: isRemove,
  });

  // Emit realtime profile updated event across all user rooms
  try {
    const { emitToUser } = require('../realtime/emitter');
    const userId = req.user._id.toString();
    emitToUser(userId, 'profile:updated', { user });
    emitToUser(userId, 'user:profile_updated', { user });
    emitToUser(userId, 'user:updated', { user });
    emitToUser(userId, 'profile:force_refresh', { userId });
    if (req.user.email) {
      emitToUser(req.user.email.toLowerCase(), 'profile:updated', { user });
      emitToUser(req.user.email.toLowerCase(), 'profile:force_refresh', { userId });
    }
  } catch (_) { }

  res.status(200).json(new ApiResponse(200, { user, ...user }, 'Profile updated successfully'));
});

const removeProfilePicture = asyncHandler(async (req, res) => {
  const user = await authService.removeProfilePicture(req.user._id);

  try {
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(req.user._id, 'profile:updated', { user });
    emitToUser(req.user._id, 'user:profile_updated', { user });
    if (req.user.email) {
      emitToUser(req.user.email.toLowerCase(), 'profile:updated', { user });
    }
  } catch (_) { }

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

  let pic = u.profilePicture || u.profileImage || u.avatar || '';

  // If stored image is a base64 data URI, auto-migrate to static URL file for mobile app
  if (pic && pic.startsWith('data:image/')) {
    try {
      const publicUrl = await saveProfileImage(pic, u._id, req);
      if (publicUrl && publicUrl.startsWith('http')) {
        pic = publicUrl;
        u.profilePicture = publicUrl;
        u.profileImage = publicUrl;
        u.avatar = publicUrl;
        await u.save();
      }
    } catch (err) {
      console.warn('Auto image migration error:', err);
    }
  }

  // If pic has localhost/127.0.0.1/IP, normalize to production domain https://api.kosmicowellness.com
  if (pic && (pic.includes('localhost:5000') || pic.includes('127.0.0.1:5000') || pic.includes('3.7.180.215:5000'))) {
    pic = pic.replace(/http:\/\/(localhost|127\.0\.0\.1|3\.7\.180\.215):5000/, 'https://api.kosmicowellness.com');
    u.profilePicture = pic;
    u.profileImage = pic;
    u.avatar = pic;
    await u.save();
  }

  let isSubscribed = Boolean(
    u.isSubscribed ||
    u.subscriptionStatus === 'active' ||
    u.subscription?.isActive === true ||
    u.subscription?.status === 'active'
  );
  let subscriptionDaysLeft = 0;

  if (isSubscribed) {
    const expiresAt =
      u.subscription?.expiresAt ||
      u.subscriptionExpiresAt ||
      (u.subscription?.activatedAt
        ? new Date(new Date(u.subscription.activatedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
        : null) ||
      (u.subscriptionActivatedAt
        ? new Date(new Date(u.subscriptionActivatedAt).getTime() + 30 * 24 * 60 * 60 * 1000)
        : null);

    if (expiresAt) {
      const diffMs = new Date(expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        isSubscribed = false;
        u.isSubscribed = false;
        u.subscriptionStatus = 'expired';
        u.subscriptionDaysLeft = 0;
        if (u.subscription) {
          u.subscription.isActive = false;
          u.subscription.status = 'expired';
        }
        await u.save();
        subscriptionDaysLeft = 0;
      } else {
        // Dynamic day countdown matching mobile floor calculation (30 -> 29 -> 28 -> ...)
        subscriptionDaysLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        u.subscriptionDaysLeft = subscriptionDaysLeft;
        if (!u.subscription && u.subscriptionActivatedAt) {
          u.subscription = {
            status: 'active',
            isActive: true,
            plan: 'kosmico_premium_monthly',
            activatedAt: u.subscriptionActivatedAt,
            expiresAt,
          };
        }
        await u.save();
      }
    } else {
      subscriptionDaysLeft = u.subscriptionDaysLeft || 30;
    }
  }

  const userPhone = u.phoneNumber || u.phone || '';
  const userTrials = u.trials || {
    plate_scan: 2,
    bp_scan: 2,
    community_post: 2,
    smartwatch_connect: 2,
  };

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
    isSubscribed,
    subscriptionStatus: isSubscribed ? 'active' : 'trial',
    subscriptionDaysLeft: isSubscribed ? subscriptionDaysLeft : 0,
    trials: userTrials,
    subscription: u.subscription,
    savedPaymentMethods: u.savedPaymentMethods || [],
    paymentMethods: u.savedPaymentMethods || [],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  res.status(200).json(new ApiResponse(200, { user, ...user }, 'User data retrieved'));
});

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  signupVerify,
  login,
  loginVerify,
  resendOtp,
  updateProfile,
  removeProfilePicture,
  refresh,
  logout,
  getMe,
};
