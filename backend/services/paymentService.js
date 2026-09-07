const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { ApiError } = require('../utils/apiResponse');
const notificationService = require('./notificationService');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  /**
   * Create a Razorpay Order and initialize our internal Payment record.
   */
  async createPayment(orderId, userId) {
    const order = await Order.findOne({ _id: orderId, user: userId });
    
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }
    if (order.orderStatus === 'CANCELLED') {
      throw new ApiError(400, 'Cannot pay for a cancelled order');
    }
    if (order.paymentStatus === 'PAID') {
      throw new ApiError(400, 'Order is already paid');
    }

    // Convert total to smallest currency unit (paise)
    const amountInSmallestUnit = Math.round(order.total * 100);
    const currency = 'INR';

    let rzpOrder;
    try {
      rzpOrder = await this.razorpay.orders.create({
        amount: amountInSmallestUnit,
        currency,
        receipt: `receipt_order_${order.orderNumber}`,
      });
    } catch (err) {
      console.error('Razorpay API Error:', err);
      throw new ApiError(500, 'Failed to initialize payment gateway');
    }

    // Store Payment Record
    const payment = await Payment.create({
      order: order._id,
      user: userId,
      providerOrderId: rzpOrder.id,
      amount: amountInSmallestUnit,
      currency,
      status: 'CREATED',
    });

    return {
      providerOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify signature explicitly sent by frontend.
   */
  async verifyPaymentSignature(userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    const payment = await Payment.findOne({ providerOrderId: razorpay_order_id, user: userId }).populate('order');
    if (!payment) {
      throw new ApiError(404, 'Payment record not found');
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      payment.status = 'FAILED';
      payment.failureReason = 'Signature mismatch';
      await payment.save();
      
      notificationService.createPaymentNotification(userId, payment.order._id, payment.order.orderNumber, false).catch(console.error);
      const { emitToUser, emitToAdmins } = require('../realtime/emitter');
      emitToUser(userId, 'payment:failed', { orderId: payment.order._id });
      emitToAdmins('admin:payment-updated', { orderId: payment.order._id, status: 'FAILED' });
      
      throw new ApiError(400, 'Invalid payment signature');
    }

    // Verified successfully
    payment.status = 'PAID';
    payment.providerPaymentId = razorpay_payment_id;
    payment.verifiedAt = new Date();
    await payment.save();

    // Update internal Order
    const order = await Order.findById(payment.order._id);
    if (order && order.paymentStatus !== 'PAID') {
      order.paymentStatus = 'PAID';
      // Automatically advance status to processing upon payment
      if (order.orderStatus === 'PENDING') {
        order.orderStatus = 'PROCESSING';
      }
      await order.save();
      
      notificationService.createPaymentNotification(userId, order._id, order.orderNumber, true).catch(console.error);
      const { emitToUser, emitToAdmins, emitToOrder } = require('../realtime/emitter');
      emitToUser(userId, 'payment:success', { orderId: order._id });
      emitToAdmins('admin:payment-updated', { orderId: order._id, status: 'PAID' });
      if (order.orderStatus === 'PROCESSING') {
        emitToOrder(order._id, 'order:processing', { orderId: order._id, status: 'PROCESSING' });
        emitToAdmins('admin:order-updated', { orderId: order._id, status: 'PROCESSING' });
      }

      const emailService = require('../utils/email');
      const userDoc = await mongoose.model('User').findById(userId);
      if (userDoc) {
        await emailService.sendOrderConfirmationEmail(order, userDoc);
      }
    }

    return payment;
  }

  /**
   * Secure Webhook handler for out-of-band payment synchronization
   */
  async handleWebhook(rawBody, signature) {
    try {
      Razorpay.validateWebhookSignature(
        rawBody,
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET
      );
    } catch (err) {
      throw new ApiError(400, 'Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured' || event.event === 'payment.authorized') {
      const paymentEntity = event.payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;
      
      const payment = await Payment.findOne({ providerOrderId: rzpOrderId }).populate('order');
      if (!payment) return;

      // Idempotency: Ignore if already PAID
      if (payment.status === 'PAID') return;

      payment.status = 'PAID';
      payment.providerPaymentId = paymentEntity.id;
      payment.method = paymentEntity.method;
      payment.verifiedAt = new Date();
      await payment.save();

      const order = await Order.findById(payment.order._id);
      if (order && order.paymentStatus !== 'PAID') {
        order.paymentStatus = 'PAID';
        if (order.orderStatus === 'PENDING') {
          order.orderStatus = 'PROCESSING';
        }
        await order.save();
        notificationService.createPaymentNotification(payment.user, order._id, order.orderNumber, true).catch(console.error);
        const { emitToUser, emitToAdmins, emitToOrder } = require('../realtime/emitter');
        emitToUser(payment.user, 'payment:success', { orderId: order._id });
        emitToAdmins('admin:payment-updated', { orderId: order._id, status: 'PAID' });
        if (order.orderStatus === 'PROCESSING') {
          emitToOrder(order._id, 'order:processing', { orderId: order._id, status: 'PROCESSING' });
          emitToAdmins('admin:order-updated', { orderId: order._id, status: 'PROCESSING' });
        }
        
        const emailService = require('../utils/email');
        const userDoc = await mongoose.model('User').findById(payment.user);
        if (userDoc) {
          await emailService.sendOrderConfirmationEmail(order, userDoc);
        }
      }
    } else if (event.event === 'payment.failed') {
      const paymentEntity = event.payload.payment.entity;
      const rzpOrderId = paymentEntity.order_id;
      
      const payment = await Payment.findOne({ providerOrderId: rzpOrderId }).populate('order');
      if (!payment) return;
      if (payment.status === 'PAID') return; // Cannot fail an already paid order

      payment.status = 'FAILED';
      payment.failureReason = paymentEntity.error_description || 'Payment failed';
      await payment.save();
      
      if (payment.order) {
        notificationService.createPaymentNotification(payment.user, payment.order._id, payment.order.orderNumber, false).catch(console.error);
        const { emitToUser, emitToAdmins } = require('../realtime/emitter');
        emitToUser(payment.user, 'payment:failed', { orderId: payment.order._id });
        emitToAdmins('admin:payment-updated', { orderId: payment.order._id, status: 'FAILED' });
      }
    }
  }
}

module.exports = new PaymentService();
