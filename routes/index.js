const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Post = require("../model/Posts");
const Comment = require("../model/Comments");

/* GET home page. */
router.get("/", forwardAuthenticated, (req, res) => {
  res.render("index", { title: "userApp" });
});

// Dashboard get user posts
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const userPosts = await Post.find({ user: req.user.id })
    .populate("user")
    .exec();
  let commentsOnUsersPost = [];
  const userPostsId = userPosts.map((post) => post._id.toString());
  for (let i = 0; i < userPostsId.length; i++) {
    commentsOnUsersPost.push(
      await Comment.find({ post: userPostsId[i] }).populate("user").exec()
    );
  }
  res.render("dashboard", {
    user: req.user,
    posts: userPosts.reverse(),
    comments: commentsOnUsersPost.reverse(),
  });
});

// Get posts for home page
router.get("/home", ensureAuthenticated, async (req, res) => {
  const posts = await Post.find({ status: true }).populate("user").exec();
  let commentsOnEachPost = [];
  const userPostsId = posts.map((post) => post._id.toString());
  for (let i = 0; i < userPostsId.length; i++) {
    commentsOnEachPost.push(
      await Comment.find({ post: userPostsId[i] }).populate("user").exec()
    );
  }
  res.render("home", {
    user: req.user,
    posts: posts.reverse(),
    comments: commentsOnEachPost.reverse(),
  });
});


module.exports = router;
