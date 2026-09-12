const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All notification routes require authentication

router.route('/')
  .get(notificationController.getNotifications)
  .delete(notificationController.clearAllNotifications);

router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);

router.route('/:id/read')
  .patch(notificationController.markAsRead)
  .put(notificationController.markAsRead);

router.route('/:id')
  .delete(notificationController.deleteNotification);

module.exports = router;
