const Notification = require('../models/Notification');
const { ApiError } = require('../utils/apiResponse');
const { notificationQueue } = require('../jobs/queue');
const { redis } = require('../config/redis');

class NotificationService {
  async createNotification(userId, type, title, message, data = {}) {
    try {
      if (redis.status !== 'ready') {
        console.warn('Redis unavailable, falling back to synchronous notification creation.');
        await this._processPersistNotification({ userId, type, title, message, data });
        return true;
      }

      // Enqueue job for background processing
      await notificationQueue.add(
        'create-notification',
        { userId, type, title, message, data },
        {
          jobId: `notif-${userId}-${type}-${data?.orderId || Date.now()}`, // Enforce idempotency at the queue level
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to enqueue notification:', error.message);
      return false; // Do not crash business logic
    }
  }

  // This method is called by the worker strictly to persist
  async _processPersistNotification(jobData) {
    const { userId, type, title, message, data } = jobData;
    try {
      const notification = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data,
      });
      
      const { emitToUser } = require('../realtime/emitter');
      const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });
      emitToUser(userId, 'notification:new', notification);
      emitToUser(userId, 'notification:unread-count', { count: unreadCount });
      
    } catch (error) {
      if (error.code === 11000) {
        return null; // DB-level idempotency caught it
      }
      throw error; // Let BullMQ retry
    }
  }

  async createOrderNotification(userId, orderId, orderNumber, status) {
    let type = 'ORDER_CREATED';
    let title = 'Order Placed';
    let message = `Your order ${orderNumber} has been placed successfully.`;

    if (status === 'PROCESSING') {
      type = 'ORDER_PROCESSING';
      title = 'Order Processing';
      message = `Your order ${orderNumber} is now being processed.`;
    } else if (status === 'SHIPPED') {
      type = 'ORDER_SHIPPED';
      title = 'Order Shipped';
      message = `Your order ${orderNumber} has been shipped.`;
    } else if (status === 'DELIVERED') {
      type = 'ORDER_DELIVERED';
      title = 'Order Delivered';
      message = `Your order ${orderNumber} has been delivered.`;
    } else if (status === 'CANCELLED') {
      type = 'ORDER_CANCELLED';
      title = 'Order Cancelled';
      message = `Your order ${orderNumber} has been cancelled.`;
    }

    return await this.createNotification(userId, type, title, message, { orderId, orderNumber });
  }

  async createPaymentNotification(userId, orderId, orderNumber, isSuccess) {
    const type = isSuccess ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED';
    const title = isSuccess ? 'Payment Successful' : 'Payment Failed';
    const message = isSuccess
      ? `Payment for order ${orderNumber} was successful.`
      : `Payment for order ${orderNumber} failed. You can retry from your orders page.`;

    return await this.createNotification(userId, type, title, message, { orderId, orderNumber });
  }

  async getUserNotifications(userId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const filter = {
      $or: [
        { user: userId },
        { userId: userId },
        { user: userId.toString() },
        { userId: userId.toString() },
      ],
    };

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Notification.countDocuments(filter);
    
    return {
      notifications,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  async getUnreadCount(userId) {
    const filter = {
      $or: [
        { user: userId },
        { userId: userId },
        { user: userId.toString() },
        { userId: userId.toString() },
      ],
      $and: [
        { $or: [{ isRead: false }, { read: false }, { isRead: { $exists: false } }] },
      ],
    };
    return await Notification.countDocuments(filter);
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        $or: [{ user: userId }, { userId: userId }, { user: userId.toString() }, { userId: userId.toString() }] 
      },
      { isRead: true, read: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }
    const { emitToUser } = require('../realtime/emitter');
    const unreadCount = await this.getUnreadCount(userId);
    emitToUser(userId, 'notification:unread-count', { count: unreadCount });
    return notification;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      { 
        $or: [{ user: userId }, { userId: userId }, { user: userId.toString() }, { userId: userId.toString() }],
        $and: [{ $or: [{ isRead: false }, { read: false }, { isRead: { $exists: false } }] }] 
      },
      { isRead: true, read: true, readAt: new Date() }
    );
    const { emitToUser } = require('../realtime/emitter');
    emitToUser(userId, 'notification:unread-count', { count: 0 });
    return true;
  }
}

module.exports = new NotificationService();
