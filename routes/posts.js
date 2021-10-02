const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Post = require("../model/Posts");
const Comment = require("../model/Comments");


// view a profiles posts
router.get("/profile/:id/:pid?", ensureAuthenticated, async (req, res) => {
    if (req.params.id === req.user.id) {
      res.redirect("/dashboard");
    } else {

      let userPosts;
        if(req.query.search){
          userPosts = await Post.find({ user: req.params.id, status: true, description:  new RegExp(req.query.search, 'i') })
            .populate("user")
            .exec();    
        }else{
          userPosts = await Post.find({ user: req.params.id, status: true })
            .populate("user")
            .exec();
        }  
        
      let commentsOnEachPost = [];
      const userPostsId = userPosts.map((post) => post._id.toString());
      for (let i = 0; i < userPostsId.length; i++) {
        commentsOnEachPost.push(
          await Comment.find({ post: userPostsId[i] }).populate("user").exec()
        );
      }
      res.render("viewProfile", {
        user: req.user,
        posts: userPosts.reverse(),
        comments: commentsOnEachPost.reverse(),
        URL: '/post/profile/'+req.params.id,
        passedId: req.params.pid,
      });
    }
  });
  
  // add a post and redirect to home or posts
  router.post("/", ensureAuthenticated, async (req, res) => {
    try {
      if (req.user) {
        if (req.body.description) {
          req.body.user = req.user.id;
          await Post.create(req.body);
          res.redirect(req.body.URL); 
        } else {
          req.flash("error_msg", "Please provide a description");
          res.redirect(req.body.URL); 
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
  
  // @desc    Show edit page
  // @route   GET /post/edit/:id
  router.get("/edit/:id/:loc", ensureAuthenticated, async (req, res) => {
    try {
      const post = await Post.findOne({
        _id: req.params.id,
      });
  
      if (!post) {
        return res.render("404");
      }
  
      if (post.user != req.user.id) {
        res.redirect("/home");
      } else {
        res.render("editPost", {
          user: req.user,
          post,
          loc: req.params.loc,
        });
      }
    } catch (err) {
      console.error(err);
      return res.render("error");
    }
  });
  
  // Edit post
  // PUT /post/:id
  router.put("/:id", ensureAuthenticated, async (req, res) => {
    try {
      let post = await Post.findById(req.params.id);
  
      if (!post) {
        return res.render("404");
      }
  
      if (post.user != req.user.id) {
        res.redirect("/home");
      } else {
        post = await Post.findOneAndUpdate({ _id: req.params.id }, req.body, {
          new: true,
          runValidators: true,
        });
        res.redirect('/'+ req.body.loc + "#" + req.params.id);
      }
    } catch (err) {
      console.error(err);
      return res.render("error");
    }
  });
  
  // delete a post
  // @route   DELETE post/:id
  router.delete("/:id", ensureAuthenticated, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) {
        return res.render("404");
      }
  
      if (post.user != req.user.id) {
        res.render("error");
      } else {
        await Comment.deleteMany({ post: req.params.id})
        await Post.deleteOne({ _id: req.params.id });
        res.redirect(req.body.redirect);
      }
    } catch (err) {
      console.error(err);
      return res.render("error");
    }
  });

  // likes for the post section
  router.post("/like", ensureAuthenticated, async (req, res) => {
    const userLiked = await Post.findOne({_id: req.body.postId, 'likes.user': req.body.userId});
    if(userLiked){
      // edit the like value
      const likeCondition = userLiked.likes.findIndex(x => x.user == req.body.userId)
      await Post.updateOne(
        { _id: req.body.postId, 'likes.user': req.body.userId}, 
        { 
          $set:{
            'likes.$.value': !userLiked.likes[likeCondition].value,
          }
        }
        );
    }
    else{
      // push user to the like array
      const userLiked = {user: req.body.userId, value: true}
      await Post.updateOne(
        { _id: req.body.postId}, 
        { 
          $push:{
           likes: userLiked,
          }
        }
        );
    }
    res.status(204).send();
  });

  
  module.exports = router;
