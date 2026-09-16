const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All notification routes require authentication

// Documented Notifications Endpoints (Section 11: A, B, C, D)
router.route('/')
  .get(notificationController.getNotifications)
  .delete(notificationController.clearAllNotifications);

router.get('/unread-count', notificationController.getUnreadCount);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
