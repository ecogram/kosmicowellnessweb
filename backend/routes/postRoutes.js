const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/', postController.createPost);
router.get('/feed', postController.getFeed);
router.get('/user/:userId', postController.getUserPosts);
router.post('/:postId/like', postController.toggleLike);
router.get('/:postId/comments', postController.getComments);
router.post('/:postId/comments', postController.addComment);
router.delete('/:postId', postController.deletePost);

// Friend requests
router.post('/friend-request/send/:friendId', postController.sendFriendRequest);
router.get('/friends', postController.getFriends);
router.get('/friend-requests', postController.getFriendRequests);
router.post('/friend-request/accept/:requestId', postController.acceptFriendRequest);
router.post('/friend-request/reject/:requestId', postController.rejectFriendRequest);

module.exports = router;
