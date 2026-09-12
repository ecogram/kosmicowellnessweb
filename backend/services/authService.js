const User = require('../models/User');
const Otp = require('../models/Otp');
const RefreshToken = require('../models/RefreshToken');
const { ApiError } = require('../utils/apiResponse');
const { sendOtpEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class AuthService {
  generateAccessToken(userId) {
    const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'Kosmico_Secret_Key_123';
    return jwt.sign({ id: userId }, secret, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });
  }

  generateRefreshTokenString() {
    return crypto.randomBytes(40).toString('hex');
  }

  generateOtpCode() {
    // Generate secure 6-digit numeric OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmailOtp(email, type = 'auto') {
    if (!email) {
      throw new ApiError(400, 'Email address is required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new ApiError(400, 'Please provide a valid email address');
    }

    // 1. Validation for Registration: Ensure single account per email
    if (type === 'register') {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new ApiError(400, 'An account with this email already exists. Please log in instead.');
      }
    }

    // 2. Validation for Login: Ensure account exists
    if (type === 'login') {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
        throw new ApiError(404, 'No account found with this email. Please create an account first.');
      }
      if (!existingUser.isActive) {
        throw new ApiError(403, 'This account is disabled. Please contact support.');
      }
    }

    const otp = this.generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Remove any previous OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // Store new OTP
    await Otp.create({
      email: normalizedEmail,
      otp,
      expiresAt,
    });

    // Send email
    await sendOtpEmail(normalizedEmail, otp);

    return { success: true, message: `Verification code sent to ${normalizedEmail}` };
  }

  async verifyEmailOtp(email, otp, name, ip, type = 'auto') {
    if (!email || !otp) {
      throw new ApiError(400, 'Email and OTP are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trimmedOtp = otp.toString().trim();

    if (trimmedOtp.length !== 6) {
      throw new ApiError(400, 'Please enter a valid 6-digit OTP code.');
    }

    // 1. Find OTP record in database
    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      throw new ApiError(400, 'No OTP request found for this email. Please request a new code.');
    }

    // 2. Check if OTP is expired
    if (new Date() > new Date(otpRecord.expiresAt)) {
      await Otp.deleteMany({ email: normalizedEmail });
      throw new ApiError(400, 'Your OTP has expired. Please click "Resend Code" to receive a new OTP.');
    }

    // 3. Check if OTP is wrong
    if (otpRecord.otp !== trimmedOtp) {
      throw new ApiError(400, 'Incorrect OTP code. Please enter the valid 6-digit code sent to your email.');
    }

    // OTP is valid -> delete OTP record so it cannot be reused
    await Otp.deleteMany({ email: normalizedEmail });

    // Check user in database
    let user = await User.findOne({ email: normalizedEmail });

    if (type === 'register') {
      if (user) {
        throw new ApiError(400, 'An account with this email already exists. Please log in instead.');
      }
      const defaultName = name && name.trim().length > 0 
        ? name.trim() 
        : normalizedEmail.split('@')[0];

      user = await User.create({
        name: defaultName,
        email: normalizedEmail,
        role: 'user',
        isActive: true,
      });
    } else if (type === 'login') {
      if (!user) {
        throw new ApiError(404, 'No account found with this email. Please create an account first.');
      }
    } else {
      // Auto mode (backward compatible)
      if (!user) {
        const defaultName = name && name.trim().length > 0 
          ? name.trim() 
          : normalizedEmail.split('@')[0];

        user = await User.create({
          name: defaultName,
          email: normalizedEmail,
          role: 'user',
          isActive: true,
        });
      } else if (name && name.trim().length > 0 && (!user.name || user.name === user.email.split('@')[0])) {
        user.name = name.trim();
        await user.save();
      }
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Account is disabled. Please contact support.');
    }

    const accessToken = this.generateAccessToken(user._id);
    const refreshTokenString = this.generateRefreshTokenString();

    // Set expiry to 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
      user: user._id,
      token: RefreshToken.hashToken(refreshTokenString),
      expiresAt,
      createdByIp: ip,
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      profilePicture: user.profilePicture || '',
    };

    return { user: safeUser, accessToken, refreshToken: refreshTokenString };
  }

  async updateProfile(userId, { name, phoneNumber, profilePicture }) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (name) user.name = name.trim();
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber.trim();
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      profilePicture: user.profilePicture || '',
    };
  }

  async removeProfilePicture(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.profilePicture = '';
    await user.save();

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber || '',
      profilePicture: '',
    };
  }

  async refreshAuthToken(rawToken, ip) {
    const hashedToken = RefreshToken.hashToken(rawToken);

    const refreshTokenRecord = await RefreshToken.findOne({ token: hashedToken }).populate('user');

    if (!refreshTokenRecord || !refreshTokenRecord.isActive) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const user = refreshTokenRecord.user;
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User inactive');
    }

    // Revoke old token
    refreshTokenRecord.revokedAt = new Date();

    // Issue new token
    const newRefreshTokenString = this.generateRefreshTokenString();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const newRefreshTokenRecord = await RefreshToken.create({
      user: user._id,
      token: RefreshToken.hashToken(newRefreshTokenString),
      expiresAt,
      createdByIp: ip,
    });

    refreshTokenRecord.replacedByToken = newRefreshTokenRecord.token;
    await refreshTokenRecord.save();

    const accessToken = this.generateAccessToken(user._id);

    return { accessToken, refreshToken: newRefreshTokenString };
  }

  async logoutUser(rawToken) {
    if (!rawToken) return;
    const hashedToken = RefreshToken.hashToken(rawToken);
    await RefreshToken.findOneAndUpdate(
      { token: hashedToken },
      { revokedAt: new Date() }
    );
  }
}

module.exports = new AuthService();
