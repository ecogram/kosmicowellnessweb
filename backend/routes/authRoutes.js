const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Setup memory storage multer for file / image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Tolerant upload handler accepting both single files and multipart fields
const handleProfileUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'File upload error' });
    }
    next();
  });
};

// Apply rate limit to auth routes
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 2000, // relaxed for development
  message: 'Too many auth requests from this IP, please try again after 15 minutes',
});

router.use(authLimiter);

// Documented Auth & Profile Endpoints (Section 1: 1 - 7)
router.post('/register', authController.register);
router.post('/signup-verify', authController.signupVerify);
router.post('/login', authController.login);
router.post('/login-verify', authController.loginVerify);
router.post('/resend-otp', authController.resendOtp);
router.get('/profile', protect, authController.getMe);
router.put('/profile', protect, handleProfileUpload, authController.updateProfile);
router.patch('/profile', protect, handleProfileUpload, authController.updateProfile);
router.post('/profile', protect, handleProfileUpload, authController.updateProfile);
// Dedicated profile picture upload endpoint (called by web frontend)
router.put('/profile-picture', protect, handleProfileUpload, authController.updateProfile);
router.post('/profile-picture', protect, handleProfileUpload, authController.updateProfile);
router.patch('/profile-picture', protect, handleProfileUpload, authController.updateProfile);
// Remove profile picture endpoints
router.delete('/remove-profile-picture', protect, authController.removeProfilePicture);
router.post('/remove-profile-picture', protect, authController.removeProfilePicture);
router.delete('/profile-picture', protect, authController.removeProfilePicture);

module.exports = router;

