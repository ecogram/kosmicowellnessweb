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

// 1. Documentation-specific Auth Endpoints
router.post('/register', authController.register);
router.post('/signup-verify', authController.signupVerify);
router.post('/login', authController.login);
router.post('/login-verify', authController.loginVerify);
router.get('/profile', protect, authController.getMe);
router.put('/profile', protect, handleProfileUpload, authController.updateProfile);
router.delete('/remove-profile-picture', protect, authController.removeProfilePicture);

// 2. Existing Frontend Compatible Endpoints
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;

