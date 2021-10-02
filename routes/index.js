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
router.get("/dashboard/:id?", ensureAuthenticated, async (req, res) => {
  let userPosts
  if(req.query.search){
     userPosts = await Post.find({ user: req.user.id, description:  new RegExp(req.query.search, 'i') })
        .sort('-date')
        .populate("user")
        .exec();
  }else{
     userPosts = await Post.find({ user: req.user.id })
        .sort('-date')
        .populate("user")
        .exec();
  }    
     
  let commentsOnUsersPost = [];
  const userPostsId = userPosts.map((post) => post._id.toString());
  for (let i = 0; i < userPostsId.length; i++) {
    commentsOnUsersPost.push(
      await Comment.find({ post: userPostsId[i] }).populate("user").exec()
    );
  }
  res.render("dashboard", {
    user: req.user,
    posts: userPosts,
    comments: commentsOnUsersPost,
    passedId: req.params.id,
  });
});


// Get posts for home page
router.get("/home/:id?", ensureAuthenticated, async (req, res) => {
  let postLimit = 30;
  if(req.query.limit) postLimit = Number(req.query.limit) + 30

  let post;
  if(req.query.search){
     posts = await Post.find({ status: true , description:  new RegExp(req.query.search, 'i')})
    .sort('-date').limit(postLimit).populate("user").exec();    
  }else{
    posts = await Post.find({ status: true })
    .sort('-date').limit(postLimit).populate("user").exec();
  }   
  let commentsOnEachPost = [];

  const userPostsId = posts.map((post) => post._id.toString());
  for (let i = 0; i < userPostsId.length; i++) {
    commentsOnEachPost.push(
      await Comment.find({ post: userPostsId[i] }).populate("user").exec()
    );
  }
  res.render("home", {
    user: req.user,
    posts: posts,
    comments: commentsOnEachPost,
    passedId: req.params.id,
    limit: postLimit
  });
});



module.exports = router;
