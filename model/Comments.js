const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  commentDescription: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts',
  },
  date: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("Comments", commentSchema);