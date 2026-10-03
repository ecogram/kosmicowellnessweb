const mongoose = require('mongoose');
const Order = require('../models/Order');
const Address = require('../models/Address');
const Product = require('../models/Product');
const shiprocketService = require('./shiprocketService');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KosmicoWellness:KosmicoWellness@cluster0.67auck3.mongodb.net/kosmico';

let isSyncing = false;

async function syncPendingOrders() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // Find any order that has been paid or placed but has no shiprocketOrderId
    const eligibleOrders = await Order.find({
      $and: [
        {
          $or: [
            { paymentStatus: { $in: ['Paid', 'PAID', 'PARTIAL_PAID', 'COD_PENDING'] } },
            { orderStatus: { $in: ['Placed', 'PLACED', 'PROCESSING', 'Processing'] } },
          ],
        },
        {
          $or: [
            { shiprocketOrderId: { $exists: false } },
            { shiprocketOrderId: null },
            { shiprocketOrderId: '' },
          ],
        },
        {
          orderNumber: { $not: /^TEST|^MOCK|^DEMO|^DEV_|^DUMMY_/i },
          isTest: { $ne: true },
        },
      ],
    }).sort({ createdAt: -1 }).limit(10);

    for (const order of eligibleOrders) {
      console.log(`[Shiprocket Syncer] Found un-synced order ${order._id} (${order.orderNumber || order._id}). Syncing to Shiprocket...`);
      try {
        const srRes = await shiprocketService.createShiprocketOrder(order);
        if (srRes && (srRes.order_id || srRes.shipment_id)) {
          order.shiprocketOrderId = String(srRes.order_id || '');
          order.shiprocketShipmentId = String(srRes.shipment_id || '');
          order.courierPartner = srRes.courier_name || 'Shiprocket';
          order.shippingStatus = 'PLACED_ON_SHIPROCKET';
          if (srRes.awb_code) order.trackingNumber = srRes.awb_code;
          await order.save();
          console.log(`[Shiprocket Syncer] Successfully placed order ${order._id} on Shiprocket! SR Order ID: ${order.shiprocketOrderId}, Shipment ID: ${order.shiprocketShipmentId}`);
        }
      } catch (err) {
        console.error(`[Shiprocket Syncer] Error placing order ${order._id} on Shiprocket:`, err.response?.data || err.message);
      }
    }
  } catch (err) {
    console.error('[Shiprocket Syncer] Polling error:', err.message);
  } finally {
    isSyncing = false;
  }
}

async function startSyncer() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(MONGO_URI);
    console.log('[Shiprocket Syncer] Connected to MongoDB Atlas.');
  }

  console.log('[Shiprocket Syncer] Auto-syncer started. Polling every 5 seconds for new orders...');
  await syncPendingOrders();
  setInterval(syncPendingOrders, 5000);
}

if (require.main === module) {
  startSyncer().catch((err) => {
    console.error('Fatal syncer error:', err);
  });
}

module.exports = { startSyncer, syncPendingOrders };
