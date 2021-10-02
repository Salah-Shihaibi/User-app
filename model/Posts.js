const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
  }, 
  status: {
    type: Boolean,
    require: true,
  }, 
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  likes:{
    type: Array,
    default: []
  },
  date: {
    type: Date,
    default: Date.now,
  },

});

module.exports = mongoose.model("Posts", postSchema);