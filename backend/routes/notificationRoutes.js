const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All notification routes require authentication

// Documented Notifications Endpoints (Section 11: A, B, C, D)
router.route('/')
  .get(notificationController.getNotifications)
  .delete(notificationController.clearAllNotifications);

// Aliases for clearing all notifications (must precede /:id)
router.delete('/clear', notificationController.clearAllNotifications);
router.delete('/clear-all', notificationController.clearAllNotifications);
router.delete('/all', notificationController.clearAllNotifications);

router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
