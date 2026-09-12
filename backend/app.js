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

app.use('/api', limiter);
app.use(helmet());
app.use(
  express.json({
    limit: '10mb',
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Import Routers
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderActionRoutes = require('./routes/orderActionRoutes');
const refundRoutes = require('./routes/refundRoutes');
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
const adminRoutes = require('./routes/adminRoutes');

// Helper to register routers on both /api and /api/v1 prefixes
const registerRoutes = (prefix) => {
  app.get(`${prefix}/health`, (req, res) => {
    let redisStatus = 'unavailable';
    try {
      const { redis } = require('./config/redis');
      redisStatus = redis.status === 'ready' ? 'healthy' : 'unavailable';
    } catch (_) {}

    res.status(200).json({
      success: true,
      message: 'Kosmico Wellness API is healthy',
      environment: process.env.NODE_ENV || 'development',
      services: {
        redis: redisStatus,
      },
    });
  });

  // Core E-commerce & Store
  app.use(`${prefix}/products`, productRoutes);
  app.use(`${prefix}/products/:productId/reviews`, reviewRoutes);
  app.use(`${prefix}/categories`, categoryRoutes);
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/cart`, cartRoutes);
  app.use(`${prefix}/address`, addressRoutes);
  app.use(`${prefix}/wishlist`, wishlistRoutes);
  app.use(`${prefix}/coupons`, couponRoutes);
  app.use(`${prefix}/shiprocket`, shiprocketRoutes);

  // Orders, Payments & Refunds
  app.use(`${prefix}/payments`, paymentRoutes);
  app.use(`${prefix}/payment`, paymentRoutes);
  app.use(`${prefix}/orders`, orderRoutes);
  app.use(`${prefix}/order`, orderActionRoutes);
  app.use(`${prefix}/refund`, refundRoutes);
  app.use(`${prefix}/reviews`, reviewRoutes);

  // Health Tracking & Community
  app.use(`${prefix}/gluco`, glucoRoutes);
  app.use(`${prefix}/posts`, postRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/system`, systemRoutes);

  // Admin
  app.use(`${prefix}/admin`, adminRoutes);
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
