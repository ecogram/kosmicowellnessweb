const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const notificationService = require('../services/notificationService');
const Notification = require('../models/Notification');

const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await notificationService.getUserNotifications(req.user._id, page, limit);
  res.status(200).json(new ApiResponse(200, result, 'Notifications fetched successfully'));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json(new ApiResponse(200, { count }, 'Unread count fetched'));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(id, req.user._id);
  res.status(200).json(new ApiResponse(200, { notification }, 'Notification marked as read'));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Notification.findOneAndDelete({ _id: id, user: req.user._id });
  if (!deleted) {
    throw new ApiError(404, 'Notification not found');
  }
  res.status(200).json(new ApiResponse(200, null, 'Notification deleted successfully'));
});

const clearAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.status(200).json(new ApiResponse(200, null, 'All notifications cleared successfully'));
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
