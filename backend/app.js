const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 5000,
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost'];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps, postman, server-to-server or listed origins
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for mobile clients
      }
    },
    credentials: true,
  })
);

const path = require('path');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir, { recursive: true });
}
if (!require('fs').existsSync(profilesDir)) {
  require('fs').mkdirSync(profilesDir, { recursive: true });
}

// Serve uploaded static files publicly for Mobile App & Web
app.use('/uploads', express.static(uploadsDir));

app.use('/api', limiter);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  express.json({
    limit: '25mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Import Routers (Strictly mapped to Documented Mobile App APIs)
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const orderActionRoutes = require('./routes/orderActionRoutes');
const refundRoutes = require('./routes/refundRoutes');
const returnRoutes = require('./routes/returnRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const addressRoutes = require('./routes/addressRoutes');
const couponRoutes = require('./routes/couponRoutes');
const shiprocketRoutes = require('./routes/shiprocketRoutes');
const glucoRoutes = require('./routes/glucoRoutes');
const postRoutes = require('./routes/postRoutes');
const systemRoutes = require('./routes/systemRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const updateRoutes = require('./routes/updateRoutes');

// Helper to register routers on both /api and /api/v1 prefixes
const registerRoutes = (prefix) => {
  app.get(`${prefix}/health`, (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Kosmico Wellness API is healthy',
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // 1. Core Catalog, Categories & Reviews (Module 3)
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/products/:productId/reviews`, reviewRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);

  // 2. Authentication & User Profile (Module 1)
  app.use(`${prefix}/auth`, authRoutes);

  // 3. User Address, Wishlist, Coupons & Shipping (Modules 2, 4, 5, 8)
  app.use(`${prefix}/address`, addressRoutes);
  app.use(`${prefix}/wishlist`, wishlistRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
  app.use(`${prefix}/shiprocket`, shiprocketRoutes);

  // 4. Orders, Payments, Tracking & Refunds/Returns (Modules 6, 7)
  app.use(`${prefix}/payment`, paymentRoutes);
  app.use(`${prefix}/orders`, paymentRoutes); // alias for /orders
  app.use(`${prefix}/order`, orderActionRoutes);
  app.use(`${prefix}/refund`, refundRoutes);
  app.use(`${prefix}/return`, returnRoutes);

  // 5. Health Tracking, Community, Notifications, Emergency & System (Modules 9, 10, 11, 12)
  app.use(`${prefix}/gluco`, glucoRoutes);
  app.use(`${prefix}/posts`, postRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/system`, systemRoutes);
  app.use(`${prefix}/emergency`, emergencyRoutes);
  app.use(`${prefix}/updates`, updateRoutes);
};

// Mount both for App and Web clients
registerRoutes('/api/v1');
registerRoutes('/api');

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route Not Found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  // eslint-disable-line no-unused-vars
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  if (statusCode >= 500) {
    console.error('[SERVER-ERROR]', err);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 400;
    const duplicateField = Object.keys(err.keyValue || {})[0];
    if (duplicateField === 'email') {
      message = 'An account with this email already exists. Please log in instead.';
    } else {
      message = 'Duplicate field value entered';
    }
    errors = [{ field: duplicateField, message: 'This value already exists' }];
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors = Object.values(err.errors).map((val) => ({ field: val.path, message: val.message }));
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id of ${err.value}`;
  }

  const response = {
    success: false,
    message,
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

module.exports = app;
