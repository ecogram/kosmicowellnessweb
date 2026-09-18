const asyncHandler = require('../utils/asyncHandler');
const { ApiResponse, ApiError } = require('../utils/apiResponse');
const { Post, FriendRequest } = require('../models/Community');
const User = require('../models/User');

const { saveMediaFile } = require('../utils/profileStorage');

const createPost = asyncHandler(async (req, res) => {
  const { content, privacyLevel = 'public', tags = [], location = '' } = req.body;
  let mediaUrls = Array.isArray(req.body.mediaUrls)
    ? req.body.mediaUrls
    : (req.body.mediaUrl ? [req.body.mediaUrl] : []);

  const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
  if (file) {
    const saved = saveMediaFile(file, 'postMedia');
    mediaUrls.push(saved);
  }

  if (!content || content.trim().length === 0) {
    throw new ApiError(400, 'Post content is required');
  }

  const post = await Post.create({
    user: req.user._id,
    content,
    privacyLevel,
    mediaUrl: mediaUrls[0] || '',
    mediaUrls,
    tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
    location,
  });

  const populated = await Post.findById(post._id).populate('user', 'name profilePicture email');

  res.status(201).json(new ApiResponse(201, { post: populated }, 'Post created successfully'));
});

const getPostById = asyncHandler(async (req, res) => {
  const targetId = req.params.postId || req.params.id;
  const post = await Post.findById(targetId)
    .populate('user', 'name profilePicture email')
    .populate('comments.user', 'name profilePicture');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  res.status(200).json(new ApiResponse(200, { post }, 'Post details retrieved'));
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
  const targetId = req.params.postId || req.params.id;
  const post = await Post.findById(targetId);

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
  const targetId = req.params.postId || req.params.id;
  const post = await Post.findById(targetId).populate('comments.user', 'name profilePicture');

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  res.status(200).json(new ApiResponse(200, post.comments, 'Comments retrieved'));
});

const addComment = asyncHandler(async (req, res) => {
  const targetId = req.params.postId || req.params.id;
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    throw new ApiError(400, 'Comment text is required');
  }

  const post = await Post.findById(targetId);
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

  const updatedPost = await Post.findById(targetId).populate('comments.user', 'name profilePicture');

  res.status(201).json(new ApiResponse(201, updatedPost.comments, 'Comment added successfully'));
});

const deletePost = asyncHandler(async (req, res) => {
  const targetId = req.params.postId || req.params.id;
  const post = await Post.findOneAndDelete({ _id: targetId, user: req.user._id });

  if (!post) {
    throw new ApiError(404, 'Post not found or unauthorized');
  }

  res.status(200).json(new ApiResponse(200, null, 'Post deleted successfully'));
});

// Friend Requests
const sendFriendRequest = asyncHandler(async (req, res) => {
  const friendId = req.params.userId || req.params.friendId;

  if (friendId === req.user._id.toString()) {
    throw new ApiError(400, 'Cannot send friend request to yourself');
  }

  let request = await FriendRequest.findOne({
    sender: req.user._id,
    $or: [{ recipient: friendId }, { receiver: friendId }],
  });

  if (request) {
    if (request.status === 'pending') {
      throw new ApiError(400, 'Friend request already sent');
    }
    request.status = 'pending';
    request.recipient = friendId;
    request.receiver = friendId;
    await request.save();
  } else {
    request = await FriendRequest.create({
      sender: req.user._id,
      recipient: friendId,
      receiver: friendId,
      status: 'pending',
    });
  }

  res.status(201).json(new ApiResponse(201, { request }, 'Friend request sent successfully'));
});

const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('friends', 'name email profilePicture phoneNumber');
  res.status(200).json(new ApiResponse(200, user?.friends || [], 'Friends list retrieved'));
});

const getFriendRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    $or: [{ recipient: req.user._id }, { receiver: req.user._id }],
    status: 'pending',
  }).populate('sender', 'name email profilePicture');

  res.status(200).json(new ApiResponse(200, requests, 'Friend requests retrieved'));
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const targetId = req.params.requestId || req.params.id;
  const request = await FriendRequest.findOne({
    _id: targetId,
    $or: [{ recipient: req.user._id }, { receiver: req.user._id }],
    status: 'pending',
  });

  if (!request) {
    throw new ApiError(404, 'Friend request not found');
  }

  request.status = 'accepted';
  await request.save();

  const recipientId = request.recipient || request.receiver;

  // Add to friends list for both
  await Promise.all([
    User.findByIdAndUpdate(request.sender, { $addToSet: { friends: recipientId } }),
    User.findByIdAndUpdate(recipientId, { $addToSet: { friends: request.sender } }),
  ]);

  res.status(200).json(new ApiResponse(200, { request }, 'Friend request accepted'));
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const targetId = req.params.requestId || req.params.id;
  const request = await FriendRequest.findOne({
    _id: targetId,
    $or: [{ recipient: req.user._id }, { receiver: req.user._id }],
    status: 'pending',
  });

  if (!request) {
    throw new ApiError(404, 'Friend request not found');
  }

  request.status = 'rejected';
  await request.save();

  res.status(200).json(new ApiResponse(200, { request }, 'Friend request rejected'));
});

const editPost = asyncHandler(async (req, res) => {
  const targetId = req.params.postId || req.params.id;
  const { content, privacyLevel, tags, location } = req.body;

  const post = await Post.findOne({ _id: targetId, user: req.user._id });
  if (!post) {
    throw new ApiError(404, 'Post not found or you are not authorized to edit it');
  }

  const file = req.file || (req.files && req.files.length > 0 ? req.files[0] : null);
  let mediaUrl = req.body.mediaUrl;
  if (file) {
    post.mediaUrl = saveMediaFile(file, 'postMedia');
  } else if (mediaUrl && (mediaUrl.startsWith('data:image/') || mediaUrl.startsWith('data:video/'))) {
    post.mediaUrl = saveMediaFile(mediaUrl, 'postMedia');
  }

  if (content !== undefined) post.content = content;
  if (privacyLevel !== undefined) post.privacyLevel = privacyLevel;
  if (tags !== undefined) post.tags = tags;
  if (location !== undefined) post.location = location;

  await post.save();
  const updatedPost = await Post.findById(post._id).populate('user', 'name profilePicture email');

  res.status(200).json(new ApiResponse(200, { post: updatedPost }, 'Post updated successfully'));
});

module.exports = {
  createPost,
  getPostById,
  getFeed,
  getUserPosts,
  toggleLike,
  getComments,
  addComment,
  editPost,
  deletePost,
  sendFriendRequest,
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
};
