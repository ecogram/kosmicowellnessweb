const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Post, FriendRequest } = require('../models/Community');
const User = require('../models/User');

const createPost = asyncHandler(async (req, res) => {
  const { content, privacyLevel = 'public', mediaUrl = '' } = req.body;

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, 'Post content is required');
  }

  const post = await Post.create({
    user: req.user._id,
    content,
    privacyLevel,
    mediaUrl,
  });

  const populated = await Post.findById(post._id).populate('user', 'name profilePicture email');

  res.status(201).json(new ApiResponse(201, { post: populated }, 'Post created successfully'));
});

const getFeed = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find({ privacyLevel: { $in: ['public', 'friends'] } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name profilePicture')
      .populate('comments.user', 'name profilePicture'),
    Post.countDocuments({ privacyLevel: { $in: ['public', 'friends'] } }),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        posts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Feed retrieved successfully'
    )
  );
});

const getUserPosts = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const posts = await Post.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('user', 'name profilePicture')
    .populate('comments.user', 'name profilePicture');

  res.status(200).json(new ApiResponse(200, { posts }, 'User posts retrieved'));
});

const toggleLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  const index = post.likes.indexOf(req.user._id);
  let isLiked = false;
  if (index === -1) {
    post.likes.push(req.user._id);
    isLiked = true;
  } else {
    post.likes.splice(index, 1);
    isLiked = false;
  }

  await post.save();

  res.status(200).json(
    new ApiResponse(200, { likesCount: post.likes.length, isLiked }, isLiked ? 'Post liked' : 'Post unliked')
  );
});

const getComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findById(postId).populate('comments.user', 'name profilePicture');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  res.status(200).json(new ApiResponse(200, post.comments, 'Comments retrieved'));
});

const addComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Comment text is required');
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  const newComment = {
    user: req.user._id,
    text: text.trim(),
    createdAt: new Date(),
  };

  post.comments.push(newComment);
  await post.save();

  const updatedPost = await Post.findById(postId).populate('comments.user', 'name profilePicture');

  res.status(201).json(new ApiResponse(201, updatedPost.comments, 'Comment added successfully'));
});

const deletePost = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOneAndDelete({ _id: postId, user: req.user._id });

  if (!post) {
    throw new ApiError(404, 'Post not found or unauthorized');
  }

  res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

// Friend Requests
const sendFriendRequest = asyncHandler(async (req, res) => {
  const { friendId } = req.params;

  if (friendId === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot send friend request to yourself');
  }

  const existing = await FriendRequest.findOne({
    sender: req.user._id,
    recipient: friendId,
    status: 'pending',
  });

  if (existing) {
    throw new ApiError(400, 'Friend request already sent');
  }

  const request = await FriendRequest.create({
    sender: req.user._id,
    recipient: friendId,
  });

  res.status(201).json(new ApiResponse(201, { request }, 'Friend request sent successfully'));
});

const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('friends', 'name email profilePicture phoneNumber');
  res.status(200).json(new ApiResponse(200, user?.friends || [], 'Friends list retrieved'));
});

const getFriendRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    recipient: req.user._id,
    status: 'pending',
  }).populate('sender', 'name email profilePicture');

  res.status(200).json(new ApiResponse(200, requests, 'Friend requests retrieved'));
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const request = await FriendRequest.findOne({ _id: requestId, recipient: req.user._id, status: 'pending' });

  if (!request) {
    throw new ApiError(404, 'Friend request not found');
  }

  request.status = 'accepted';
  await request.save();

  // Add to friends list for both
  await Promise.all([
    User.findByIdAndUpdate(request.sender, { $addToSet: { friends: request.recipient } }),
    User.findByIdAndUpdate(request.recipient, { $addToSet: { friends: request.sender } }),
  ]);

  res.status(200).json(new ApiResponse(200, { request }, 'Friend request accepted'));
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const request = await FriendRequest.findOne({ _id: requestId, recipient: req.user._id, status: 'pending' });

  if (!request) {
    throw new ApiError(404, 'Friend request not found');
  }

  request.status = 'rejected';
  await request.save();

  res.status(200).json(new ApiResponse(200, { request }, 'Friend request rejected'));
});

module.exports = {
  createPost,
  getFeed,
  getUserPosts,
  toggleLike,
  getComments,
  addComment,
  deletePost,
  sendFriendRequest,
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
};
