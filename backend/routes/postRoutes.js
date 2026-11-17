const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

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

// 1. Feeds & Public Post Details (Accessible publicly with optional auth)
router.get('/feed', optionalProtect, postController.getFeed);
router.get('/user/:userId', optionalProtect, postController.getUserPosts);
router.get('/:id/comments', optionalProtect, postController.getComments);
router.get('/:postId/comments', optionalProtect, postController.getComments);
router.get('/:id', optionalProtect, postController.getPostById);
router.get('/:postId', optionalProtect, postController.getPostById);

// 2. Protected Routes (Login required for creating posts, liking, commenting, friends)
router.use(protect);
router.use(handleMediaUpload);

// Friends & Friend Requests
router.get('/friends', postController.getFriends);
router.get('/friend-requests', postController.getFriendRequests);
router.get('/friend-request/pending', postController.getFriendRequests);
router.post('/friend-request/send/:userId', postController.sendFriendRequest);
router.post('/friend-request/send/:friendId', postController.sendFriendRequest);
router.post('/friend-request/accept/:requestId', postController.acceptFriendRequest);
router.post('/friend-request/reject/:requestId', postController.rejectFriendRequest);

// Post CRUD (Create, Edit, Delete)
router.post('/', postController.createPost);
router.put('/:id', postController.editPost);
router.put('/:postId', postController.editPost);
router.patch('/:id', postController.editPost);
router.patch('/:postId', postController.editPost);
router.delete('/:id', postController.deletePost);
router.delete('/:postId', postController.deletePost);

// Likes & Comments
router.post('/:id/like', postController.toggleLike);
router.post('/:postId/like', postController.toggleLike);
router.post('/:id/comments', postController.addComment);
router.post('/:postId/comments', postController.addComment);

module.exports = router;
