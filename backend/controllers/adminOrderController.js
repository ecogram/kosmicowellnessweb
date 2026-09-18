const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const Order = require('../models/Order');

// Helper to find order by ID, orderNumber, or shiprocketOrderId
const findOrder = async (id) => {
  if (!id) return null;
  const cleanId = id.toString().replace(/^REF-/, '').replace(/^RET-/, '');
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(cleanId);
  const query = isObjectId
    ? { $or: [{ _id: cleanId }, { orderNumber: cleanId }, { shiprocketOrderId: cleanId }] }
    : { $or: [{ orderNumber: cleanId }, { shiprocketOrderId: cleanId }, { _id: cleanId.length === 24 ? cleanId : undefined }].filter(Boolean) };
  return await Order.findOne(query);
};

// 1. PUT /admin/orders/:id/status (Update order delivery status)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus, courierPartner, trackingNumber } = req.body;

  const order = await findOrder(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (status) {
    order.orderStatus = status.toString().toUpperCase();
  }
  if (paymentStatus) {
    order.paymentStatus = paymentStatus.toString().toUpperCase();
  }
  if (courierPartner) {
    order.courierPartner = courierPartner;
  }
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }

  await order.save();

  try {
    const notificationService = require('../services/notificationService');
    notificationService.createOrderNotification(order.user, order._id, order.orderNumber, order.orderStatus).catch(() => {});
  } catch (_) {}

  try {
    const { emitToOrder, emitToAdmins } = require('../realtime/emitter');
    emitToOrder(order._id, `order:${order.orderStatus.toLowerCase()}`, { orderId: order._id, status: order.orderStatus });
    emitToAdmins('admin:order-updated', { orderId: order._id, status: order.orderStatus });
  } catch (_) {}

  res.status(200).json(
    new ApiResponse(
      200,
      {
        order,
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus,
      },
      'Order status updated successfully'
    )
  );
});

// 2. PUT /admin/return/:id/status (Update status of return)
const updateReturnStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminComment } = req.body;

  const order = await findOrder(id);
  if (!order) {
    throw new ApiError(404, 'Order or return request not found');
  }

  if (status) {
    order.returnStatus = status;
    order.refundStatus = status.toUpperCase();
  }
  if (adminComment !== undefined) {
    order.adminComment = adminComment;
  }

  await order.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        order,
        orderNumber: order.orderNumber,
        returnId: 'RET-' + order._id.toString().slice(-6),
        status: order.refundStatus || status,
        adminComment: order.adminComment,
      },
      'Return status updated successfully'
    )
  );
});

// 3. PUT /admin/refund/:id/status (Update status of refund)
const updateRefundStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminComment, refundTransactionId } = req.body;

  const order = await findOrder(id);
  if (!order) {
    throw new ApiError(404, 'Order or refund request not found');
  }

  if (status) {
    order.refundStatus = status.toUpperCase();
  }
  if (adminComment !== undefined) {
    order.adminComment = adminComment;
  }
  if (refundTransactionId !== undefined) {
    order.refundTransactionId = refundTransactionId;
  }

  await order.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        order,
        orderNumber: order.orderNumber,
        refundId: 'REF-' + order._id.toString().slice(-6),
        status: order.refundStatus,
        adminComment: order.adminComment,
        refundTransactionId: order.refundTransactionId,
      },
      'Refund status updated successfully'
    )
  );
});

module.exports = {
  updateOrderStatus,
  updateReturnStatus,
  updateRefundStatus,
};
