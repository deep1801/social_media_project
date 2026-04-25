const express = require('express');
const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
} = require('../controllers/posts');

const router = express.Router();
const { protect } = require('../middleware/auth');
const upload=require("../middleware/upload")

// Public routes
router.route('/').get(getPosts);
router.route('/:id').get(getPost);

// Protected routes
router.use(protect);

router.route('/').post(upload.single('image'), createPost);


router
  .route('/:id')
  .put(updatePost)
  .delete(deletePost);

// Like/Unlike routes
router.put('/:id/like', likePost);
router.put('/:id/unlike', unlikePost);

// Comment routes
router.post('/:id/comments', addComment);
router.delete('/:id/comments/:comment_id', deleteComment);

module.exports = router;
