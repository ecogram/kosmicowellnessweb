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
router.use(handleMediaUpload);

// 1. Feeds & Specific User Posts
router.get('/feed', postController.getFeed);
router.get('/user/:userId', postController.getUserPosts);

// 2. Friends & Friend Requests
router.get('/friends', postController.getFriends);
router.get('/friend-requests', postController.getFriendRequests);
router.get('/friend-request/pending', postController.getFriendRequests);
router.post('/friend-request/send/:userId', postController.sendFriendRequest);
router.post('/friend-request/send/:friendId', postController.sendFriendRequest);
router.post('/friend-request/accept/:requestId', postController.acceptFriendRequest);
router.post('/friend-request/reject/:requestId', postController.rejectFriendRequest);

// 3. Post CRUD & Interactions
router.post('/', postController.createPost);
router.get('/:id', postController.getPostById);
router.get('/:postId', postController.getPostById);
router.put('/:id', postController.editPost);
router.put('/:postId', postController.editPost);
router.patch('/:id', postController.editPost);
router.patch('/:postId', postController.editPost);
router.delete('/:id', postController.deletePost);
router.delete('/:postId', postController.deletePost);

// 4. Likes & Comments
router.post('/:id/like', postController.toggleLike);
router.post('/:postId/like', postController.toggleLike);
router.get('/:id/comments', postController.getComments);
router.get('/:postId/comments', postController.getComments);
router.post('/:id/comments', postController.addComment);
router.post('/:postId/comments', postController.addComment);

module.exports = router;
