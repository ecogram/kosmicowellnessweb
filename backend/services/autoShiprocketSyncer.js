const Order = require('../models/Order');
const shiprocketService = require('./shiprocketService');

let isSyncing = false;

/**
 * Scans MongoDB for:
 * 1. Confirmed & Paid orders (or valid COD) not yet synced to Shiprocket -> Pushes to Shiprocket
 * 2. Cancelled orders that are still active on Shiprocket -> Cancels them on Shiprocket
 */
async function syncPendingOrders() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // 1. Find orders eligible for Shiprocket creation:
    // MUST NOT be cancelled. Online orders MUST have paid status.
    const eligibleOrders = await Order.find({
      $and: [
        {
          orderStatus: { $nin: ['Cancelled', 'CANCELLED', 'Refunded', 'REFUNDED'] },
        },
        {
          $or: [
            // Paid online orders (Payment is 100% verified)
            {
              paymentStatus: { $in: ['Paid', 'PAID', 'Completed', 'COMPLETED', 'PARTIAL_PAID'] },
            },
            // Pure Cash on Delivery orders
            {
              paymentMethod: 'COD',
              paymentStatus: { $in: ['COD_PENDING', 'Pending', 'PENDING', 'Paid', 'PAID'] },
            },
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
      console.log(`[Shiprocket Syncer] Found verified order ${order._id}. Syncing to Shiprocket...`);
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

    // 2. Find cancelled orders that need to be cancelled on Shiprocket
    const cancelledOrders = await Order.find({
      $and: [
        { orderStatus: { $in: ['Cancelled', 'CANCELLED'] } },
        { shiprocketOrderId: { $exists: true, $ne: '', $ne: null } },
        { shippingStatus: { $ne: 'CANCELED_ON_SHIPROCKET' } },
      ],
    }).limit(10);

    for (const cancelOrd of cancelledOrders) {
      try {
        console.log(`[Shiprocket Syncer] Cancelling order ${cancelOrd._id} on Shiprocket (SR ID: ${cancelOrd.shiprocketOrderId})...`);
        const cancelRes = await shiprocketService.cancelOrder(cancelOrd.shiprocketOrderId);
        if (cancelRes.success) {
          cancelOrd.shippingStatus = 'CANCELED_ON_SHIPROCKET';
          await cancelOrd.save();
          console.log(`[Shiprocket Syncer] Order ${cancelOrd._id} cancelled on Shiprocket successfully.`);
        }
      } catch (cErr) {
        console.error(`[Shiprocket Syncer] Error cancelling order ${cancelOrd._id} on Shiprocket:`, cErr.message);
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
