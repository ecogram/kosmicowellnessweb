const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

const multer = require('multer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB for media
});

const handleMediaUpload = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Media upload error' });
    }
    next();
  });
};

router.use(protect);

router.post('/', handleMediaUpload, postController.createPost);
router.get('/feed', postController.getFeed);
router.get('/user/:userId', postController.getUserPosts);
router.post('/:postId/like', postController.toggleLike);
router.get('/:postId/comments', postController.getComments);
router.post('/:postId/comments', postController.addComment);
router.put('/:postId', handleMediaUpload, postController.editPost);
router.patch('/:postId', handleMediaUpload, postController.editPost);
router.delete('/:postId', postController.deletePost);

// Friend requests
router.post('/friend-request/send/:friendId', postController.sendFriendRequest);
router.get('/friends', postController.getFriends);
router.get('/friend-requests', postController.getFriendRequests);
router.post('/friend-request/accept/:requestId', postController.acceptFriendRequest);
router.post('/friend-request/reject/:requestId', postController.rejectFriendRequest);

module.exports = router;
