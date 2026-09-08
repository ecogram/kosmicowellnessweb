const mongoose = require('mongoose');
const crypto = require('crypto');
const orderRepository = require('../repositories/OrderRepository');
const cartRepository = require('../repositories/CartRepository');
const Product = require('../models/Product');
const IdempotencyRecord = require('../models/IdempotencyRecord');
const { ApiError } = require('../utils/apiResponse');
const shippingService = require('./shippingService');
const taxService = require('./taxService');
const notificationService = require('./notificationService');

class OrderService {
  generateOrderNumber() {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
    const year = new Date().getFullYear();
    return `SM-${year}-${randomHex}`;
  }

  async createOrder(userId, shippingAddress, billingAddress, idempotencyKey, paymentMethod = 'ONLINE') {
    // 0. Idempotency Check (Outside Transaction)
    // If a completed record exists for this user + key, just return the exact same order.
    const existingRecord = await IdempotencyRecord.findOne({ user: userId, idempotencyKey }).populate('order');
    if (existingRecord && existingRecord.order) {
      return existingRecord.order;
    }

    // 1. Fetch Cart
    const cart = await cartRepository.model.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Your cart is empty');
    }

    const session = await mongoose.startSession();
    let order;

    try {
      await session.withTransaction(async () => {
        // 2. Claim Idempotency Key (Inside Transaction)
        // If two concurrent requests reach here, the second one will throw E11000 and roll back safely
        // because of the unique compound index on { user, idempotencyKey }.
        // We will assign the order reference after we create it.
        
        let subtotal = 0;
        const orderItems = [];

        for (const cartItem of cart.items) {
          const product = cartItem.product;
          
          if (!product) {
            continue; // Gracefully skip orphaned deleted products
          }

          // Authoritative price
          let price = product.price;
          if (cartItem.variant && product.variants && product.variants.length > 0) {
            const variant = product.variants.find(v => v.size === cartItem.variant);
            if (variant) {
              price = variant.price;
            }
          }
          subtotal += price * cartItem.quantity;

          // Snapshot item
          orderItems.push({
            product: product._id,
            name: product.name,
            image: product.images?.[0] || '',
            variant: cartItem.variant,
            quantity: cartItem.quantity,
            priceSnapshot: price
          });
        }

        // 3. Shipping and Tax
        const shipping = shippingService.calculateShipping(subtotal, shippingAddress);
        const tax = taxService.calculateTax(subtotal, shippingAddress);
        const discount = 0;
        const total = subtotal + shipping + tax - discount;

        // 4. Generate Order Number
        let orderNumber;
        let isUnique = false;
        while (!isUnique) {
          orderNumber = this.generateOrderNumber();
          const existing = await orderRepository.model.findOne({ orderNumber }).session(session);
          if (!existing) isUnique = true;
        }

        // 5. Atomic Stock Decrement
        for (const item of orderItems) {
          let query = { _id: item.product, isActive: true };
          let update = {};

          if (item.variant) {
            query['variants.size'] = item.variant;
            query['variants.stock'] = { $gte: item.quantity };
            update = { $inc: { 'variants.$.stock': -item.quantity } };
          } else {
            query.stock = { $gte: item.quantity };
            update = { $inc: { stock: -item.quantity } };
          }

          const updatedProduct = await Product.findOneAndUpdate(
            query,
            update,
            { session, new: true, runValidators: true }
          );

          if (!updatedProduct) {
            throw new ApiError(400, `Insufficient stock or inactive product: ${item.name}`);
          }
        }

        // 6. Create Order
        const orderData = {
          orderNumber,
          user: userId,
          items: orderItems,
          subtotal,
          shipping,
          tax,
          discount,
          total,
          shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          orderStatus: paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: paymentMethod === 'COD' ? 'COD' : 'ONLINE'
        };

        const [createdOrder] = await orderRepository.model.create([orderData], { session });
        order = createdOrder;

        // 7. Store Completed Idempotency Result
        await IdempotencyRecord.create(
          [{ user: userId, idempotencyKey, order: order._id }],
          { session }
        );

        // 8. Clear Cart
        cart.items = [];
        await cart.save({ session });
      });
    } catch (error) {
      if (error.code === 11000 && error.keyPattern && error.keyPattern.idempotencyKey) {
        throw new ApiError(409, 'This order is currently processing. Please wait and refresh.');
      }
      if (error.name === 'MongoServerError' && error.message.includes('replica set')) {
        return await this.createOrderNonAtomic(userId, shippingAddress, billingAddress, idempotencyKey, cart, session, paymentMethod);
      }
      throw error;
    } finally {
      session.endSession();
    }

    if (order) {
      notificationService.createOrderNotification(userId, order._id, order.orderNumber, order.orderStatus).catch(console.error);
      const { emitToUser, emitToAdmins } = require('../realtime/emitter');
      emitToUser(userId, 'order:created', { orderId: order._id, orderNumber: order.orderNumber });
      emitToAdmins('admin:new-order', { orderId: order._id, orderNumber: order.orderNumber, total: order.total });
    }

    return order;
  }

  // Fallback for local environments without replica set
  async createOrderNonAtomic(userId, shippingAddress, billingAddress, idempotencyKey, cart, session, paymentMethod = 'ONLINE') {
    let subtotal = 0;
    const orderItems = [];

    // Atomic claim without transaction
    try {
      await IdempotencyRecord.create([{ user: userId, idempotencyKey, order: new mongoose.Types.ObjectId() }]);
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(409, 'This order is currently processing. Please wait and refresh.');
      }
      throw error;
    }

    try {
      for (const cartItem of cart.items) {
        const product = cartItem.product;
        if (!product) continue;

        let price = product.price;
        if (cartItem.variant && product.variants && product.variants.length > 0) {
          const variant = product.variants.find(v => v.size === cartItem.variant);
          if (variant) price = variant.price;
        }

        subtotal += price * cartItem.quantity;
        orderItems.push({
          product: product._id,
          name: product.name,
          image: product.images?.[0] || '',
          variant: cartItem.variant,
          quantity: cartItem.quantity,
          priceSnapshot: price
        });
      }

      const shipping = shippingService.calculateShipping(subtotal, shippingAddress);
      const tax = taxService.calculateTax(subtotal, shippingAddress);
      const total = subtotal + shipping + tax;

      let orderNumber;
      let isUnique = false;
      while (!isUnique) {
        orderNumber = this.generateOrderNumber();
        const existing = await orderRepository.model.findOne({ orderNumber });
        if (!existing) isUnique = true;
      }

      for (const item of orderItems) {
        let query = { _id: item.product, isActive: true };
        let update = {};

        if (item.variant) {
          query['variants.size'] = item.variant;
          query['variants.stock'] = { $gte: item.quantity };
          update = { $inc: { 'variants.$.stock': -item.quantity } };
        } else {
          query.stock = { $gte: item.quantity };
          update = { $inc: { stock: -item.quantity } };
        }

        const updatedProduct = await Product.findOneAndUpdate(
          query,
          update,
          { new: true }
        );

        if (!updatedProduct) {
          throw new ApiError(400, `Insufficient stock or inactive product: ${item.name}`);
        }
      }

      const [createdOrder] = await orderRepository.model.create([{
        orderNumber, user: userId, items: orderItems, subtotal, shipping, tax, total,
        shippingAddress, billingAddress: billingAddress || shippingAddress, 
        orderStatus: paymentMethod === 'COD' ? 'PROCESSING' : 'PENDING', 
        paymentStatus: 'PENDING',
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'ONLINE'
      }]);

      await IdempotencyRecord.updateOne({ user: userId, idempotencyKey }, { order: createdOrder._id });
      
      cart.items = [];
      await cart.save();

      notificationService.createOrderNotification(userId, createdOrder._id, createdOrder.orderNumber, createdOrder.orderStatus).catch(console.error);
      const { emitToUser, emitToAdmins } = require('../realtime/emitter');
      emitToUser(userId, 'order:created', { orderId: createdOrder._id, orderNumber: createdOrder.orderNumber });
      emitToAdmins('admin:new-order', { orderId: createdOrder._id, orderNumber: createdOrder.orderNumber, total: createdOrder.total });

      return createdOrder;
    } catch (error) {
      await IdempotencyRecord.deleteOne({ user: userId, idempotencyKey });
      throw error;
    }
  }

  async getOrder(orderNumber, userId) {
    const order = await orderRepository.model.findOne({ orderNumber, user: userId });
    if (!order) throw new ApiError(404, 'Order not found');
    return order;
  }

  async getUserOrders(userId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const filter = { user: userId };
    
    return await orderRepository.paginate(filter, { 
      page: parseInt(page, 10), 
      limit: parseInt(limit, 10), 
      sort: '-createdAt' 
    });
  }

  async cancelOrder(orderNumber, userId) {
    const order = await orderRepository.model.findOne({ orderNumber, user: userId });
    if (!order) throw new ApiError(404, 'Order not found');
    
    if (order.orderStatus !== 'PENDING' && order.orderStatus !== 'CONFIRMED') {
      throw new ApiError(400, `Cannot cancel order in ${order.orderStatus} status`);
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    order.orderStatus = 'CANCELLED';
    await order.save();
    
    notificationService.createOrderNotification(userId, order._id, order.orderNumber, 'CANCELLED').catch(console.error);
    
    const { emitToOrder, emitToAdmins } = require('../realtime/emitter');
    emitToOrder(order._id, 'order:cancelled', { orderId: order._id, status: 'CANCELLED' });
    emitToAdmins('admin:order-updated', { orderId: order._id, status: 'CANCELLED' });

    return order;
  }

  async updateOrderStatus(id, status) {
    const order = await orderRepository.update(id, { orderStatus: status });
    if (!order) throw new ApiError(404, 'Order not found');
    
    notificationService.createOrderNotification(order.user, order._id, order.orderNumber, status).catch(console.error);
    
    const { emitToOrder, emitToAdmins } = require('../realtime/emitter');
    const eventName = `order:${status.toLowerCase()}`;
    emitToOrder(order._id, eventName, { orderId: order._id, status });
    emitToAdmins('admin:order-updated', { orderId: order._id, status });
    
    return order;
  }
}

module.exports = new OrderService();
