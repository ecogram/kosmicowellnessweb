const Order = require('../models/Order');
const shiprocketService = require('./shiprocketService');

let isSyncing = false;

/**
 * Scans MongoDB for any orders that are Paid/Placed/Processing/COD
 * but not yet synced to Shiprocket, and pushes them immediately.
 */
async function syncPendingOrders() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    const eligibleOrders = await Order.find({
      $and: [
        {
          $or: [
            { paymentStatus: { $in: ['Paid', 'PAID', 'PARTIAL_PAID', 'COD_PENDING', 'Completed', 'COMPLETED'] } },
            { orderStatus: { $in: ['Placed', 'PLACED', 'PROCESSING', 'Processing', 'CONFIRMED', 'Confirmed'] } },
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
    })
      .sort({ createdAt: -1 })
      .limit(10);

    for (const order of eligibleOrders) {
      console.log(`[Shiprocket Syncer] Found un-synced order ${order._id} (${order.orderNumber || order._id}). Syncing to Shiprocket...`);
      try {
        const result = await shiprocketService.createOrder(order);
        if (result && result.success) {
          console.log(`[Shiprocket Syncer] Successfully placed order ${order._id} on Shiprocket! SR Order ID: ${result.order_id}`);
        } else {
          console.warn(`[Shiprocket Syncer] Could not sync order ${order._id}:`, result?.error);
        }
      } catch (err) {
        console.error(`[Shiprocket Syncer] Error placing order ${order._id} on Shiprocket:`, err.message);
      }
    }
  } catch (err) {
    console.error('[Shiprocket Syncer] Polling error:', err.message);
  } finally {
    isSyncing = false;
  }
}

function startSyncer(intervalMs = 4000) {
  console.log('[Shiprocket Syncer] Background syncer initialized. Monitoring orders...');
  syncPendingOrders().catch(console.error);
  setInterval(syncPendingOrders, intervalMs);
}

module.exports = { startSyncer, syncPendingOrders };
