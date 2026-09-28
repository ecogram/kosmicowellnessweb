const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redisConfig } = require('../config/redis');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        // Allow mobile apps, web clients, postman, etc.
        callback(null, true);
      },
      credentials: true,
    },
  });

  // Socket.IO Memory / Redis Adapter
  if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    try {
      const pubClient = new Redis(redisConfig);
      const subClient = pubClient.duplicate();
      pubClient.on('error', () => {});
      subClient.on('error', () => {});
      io.adapter(createAdapter(pubClient, subClient));
      console.log('Socket.IO Redis Adapter connected');
    } catch (error) {
      console.log('Socket.IO running in memory mode');
    }
  } else {
    console.log('Socket.IO running in lightweight memory mode');
  }

  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      // Allow token via auth object (preferred) or headers
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (!token) {
        // Allow guest / unauthenticated connection for public broadcasts (e.g. stock, product updates)
        socket.user = null;
        return next();
      }

      const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'Kosmico_Secret_Key_123';
      const decoded = jwt.verify(token, secret);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        socket.user = null;
        return next();
      }
      
      if (!user.isActive) {
        return next(new Error('Authentication error: User account deactivated'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      // Allow as guest connection rather than dropping
      socket.user = null;
      next();
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    if (socket.user) {
      console.log(`Socket connected: ${socket.id} (User: ${socket.user._id})`);
      const userRoom = `user:${socket.user._id}`;
      socket.join(userRoom);
      socket.join(`user:${socket.user._id.toString()}`);
      if (socket.user.email) {
        socket.join(`user:${socket.user.email.toLowerCase()}`);
      }
    } else {
      console.log(`Socket connected as guest/public: ${socket.id}`);
      socket.join('public');
    }

    // Support runtime authentication upgrade when guest logs in
    socket.on('authenticate', async (token) => {
      try {
        if (!token) return;
        const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'Kosmico_Secret_Key_123';
        const decoded = jwt.verify(token, secret);
        const user = await User.findById(decoded.id).select('-password');
        if (user && user.isActive) {
          socket.user = user;
          socket.join(`user:${user._id}`);
          socket.join(`user:${user._id.toString()}`);
          if (user.email) socket.join(`user:${user.email.toLowerCase()}`);
          console.log(`Socket ${socket.id} upgraded to authenticated user: ${user._id}`);
        }
      } catch (_) {}
    });

    // Join specific order room
    socket.on('join:order', async (orderId) => {
      try {
        const Order = require('../models/Order');
        const order = await Order.findById(orderId);
        
        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        if (order.user.toString() !== socket.user._id.toString()) {
          socket.emit('error', { message: 'Unauthorized to join this order room' });
          return;
        }

        socket.join(`order:${orderId}`);
        console.log(`Socket ${socket.id} joined room order:${orderId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join order room' });
      }
    });

    socket.on('leave:order', (orderId) => {
      socket.leave(`order:${orderId}`);
      console.log(`Socket ${socket.id} left room order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${socket.user._id})`);
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIo,
};
