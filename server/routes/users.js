const express = require('express');
const {
  getUsers,
  getUser,
  followUser,
  unfollowUser,
} = require('../controllers/users');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.route('/').get(protect, getUsers);
router.route('/:id').get(getUser);
router.put('/:id/follow', protect, followUser);
router.put('/:id/unfollow', protect, unfollowUser);

module.exports = router;
