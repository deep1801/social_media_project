const Post = require('../models/Post');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { createNotification } = require('./notifications');

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find()
    .populate('user', ['name', 'avatar'])
    .populate('comments.user', ['name', 'avatar'])
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate('user', ['name', 'avatar'])
    .populate('comments.user', ['name', 'avatar']);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Add image URL if file exists
  if (req.file) {
    req.body.image = `/uploads/${req.file.filename}`;
  }


  const post = await Post.create(req.body);

  // Populate user details
  await post.populate('user', ['name', 'avatar']);

  res.status(201).json({
    success: true,
    data: post,
  });
});



exports.deleteComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  

  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  // Find the comment to delete
  const comment = post.comments.id(req.params.comment_id);

  if (!comment) {
    return next(new ErrorResponse('Comment not found', 404));
  }

  // Ensure only comment owner or post owner can delete
  if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this comment', 401));
  }

  // Remove comment
  comment.deleteOne();  

  await post.save();

  res.status(200).json({
    success: true,
    data: post,
  });
});



// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner
  if (post.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this post`,
        401
      )
    );
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('user', ['name', 'avatar']);

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is post owner
  if (post.user.toString() !== req.user.id) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this post`,
        401
      )
    );
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Like a post
// @route   PUT /api/v1/posts/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if the post has already been liked by this user
  if (post.likes.some((like) => like.user.toString() === req.user.id)) {
    return next(new ErrorResponse('Post already liked', 400));
  }

  post.likes.unshift({ user: req.user.id });

  await post.save();
  await post.populate('user', ['name', 'avatar']);
  await post.populate('comments.user', ['name', 'avatar']);

  // Create notification if not own post
  if (post.user._id.toString() !== req.user.id) {
    const currentUser = await User.findById(req.user.id);
    await createNotification(
      post.user._id,
      req.user.id,
      'like',
      `${currentUser.name} liked your post`,
      post._id
    );
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Unlike a post
// @route   PUT /api/v1/posts/:id/unlike
// @access  Private
exports.unlikePost = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if the post has not yet been liked
  if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
    return next(new ErrorResponse('Post has not yet been liked', 400));
  }

  // Remove the like
  post.likes = post.likes.filter(
    (like) => like.user.toString() !== req.user.id
  );

  await post.save();
  await post.populate('user', ['name', 'avatar']);
  await post.populate('comments.user', ['name', 'avatar']);

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Add comment to post
// @route   POST /api/v1/posts/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(
      new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
    );
  }

  const user = await User.findById(req.user.id).select('name avatar');

  const newComment = {
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  };

  post.comments.unshift(newComment);

  await post.save();
  await post.populate('user', ['name', 'avatar']);
  await post.populate('comments.user', ['name', 'avatar']);

  // Create notification if not own post
  if (post.user._id.toString() !== req.user.id) {
    await createNotification(
      post.user._id,
      req.user.id,
      'comment',
      `${user.name} commented on your post`,
      post._id
    );
  }

  res.status(200).json({
    success: true,
    data: post,
  });
});

// @desc    Delete comment from post
// @route   DELETE /api/v1/posts/:id/comments/:comment_id
// @access  Private
// exports.deleteComment = asyncHandler(async (req, res, next) => {
//   const post = await Post.findById(req.params.id);

//   if (!post) {
//     return next(
//       new ErrorResponse(`Post not found with id of ${req.params.id}`, 404)
//     );
//   }

//   // Pull out comment
//   const comment = post.comments.find(
//     (comment) => comment.id === req.params.comment_id
//   );

//   // Make sure comment exists
//   if (!comment) {
//     return next(new ErrorResponse('Comment does not exist', 404));
//   }

//   // Check user
//   if (comment.user.toString() !== req.user.id) {
//     return next(
//       new ErrorResponse('User not authorized to delete this comment', 401)
//     );
//   }

//   // Remove comment
//   post.comments = post.comments.filter(
//     (comment) => comment.id !== req.params.comment_id
//   );

//   await post.save();
//   await post.populate('user', ['name', 'avatar']);
//   await post.populate('comments.user', ['name', 'avatar']);

//   res.status(200).json({
//     success: true,
//     data: post,
//   });
// });
