const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { redisConfig } = require('../config/redis');
const Redis = require('ioredis');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initializeSocket = (httpServer) => {
  const allowedOrigins = ['http://localhost:5173', 'http://localhost'];
  if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
    allowedOrigins.push(process.env.CLIENT_URL);
  }

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
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
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      if (!user.isActive) {
        return next(new Error('Authentication error: User account deactivated'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user._id})`);

    // Join specific user room
    const userRoom = `user:${socket.user._id}`;
    socket.join(userRoom);
    
    // Join admin room if applicable
    if (socket.user.role === 'admin') {
      socket.join('admins');
      console.log(`Socket ${socket.id} joined 'admins' room`);
    }

    // Join specific order room
    socket.on('join:order', async (orderId) => {
      try {
        const Order = require('../models/Order');
        const order = await Order.findById(orderId);
        
        if (!order) {
          socket.emit('error', { message: 'Order not found' });
          return;
        }

        if (socket.user.role !== 'admin' && order.user.toString() !== socket.user._id.toString()) {
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
