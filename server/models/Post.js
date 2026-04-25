const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Please add some text'],
      maxlength: [500, 'Post cannot be more than 500 characters'],
    },
    image: {
      type: String,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        text: {
          type: String,
          required: true,
          maxlength: [300, 'Comment cannot be more than 300 characters'],
        },
        name: {
          type: String,
        },
        avatar: {
          type: String,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Cascade delete comments when a post is deleted
PostSchema.pre('remove', async function (next) {
  console.log(`Comments being removed from post ${this._id}`);
  await this.model('Comment').deleteMany({ post: this._id });
  next();
});

module.exports = mongoose.model('Post', PostSchema);
