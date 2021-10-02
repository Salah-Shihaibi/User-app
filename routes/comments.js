const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Comment = require("../model/Comments");


// add a post and redirect to home or posts
router.post("/", ensureAuthenticated, async (req, res) => {
    try {
      if (req.user) {
        if (req.body.commentDescription) {
          req.body.user = req.user.id;
          // pass the post id with an input with the name post and value of post id
          await Comment.create(req.body);
          res.redirect(req.body.URL); 
        } else {
          req.flash("error_msg", "Please provide a comment description");
          res.redirect(req.body.URL);
        }
      }
    } catch (err) {
      console.error(err);
    }
  });
  
  
  // Edit post
  // PUT /post/:id
  router.put('/:id', ensureAuthenticated, async (req, res) => {
    try {
      let comment = await Comment.findById(req.params.id)
  
      if (!comment) {
        return res.render('404')
      }
  
      if (comment.user != req.user.id) {
        res.redirect('/home')
      } else {
        await Comment.updateOne(
          { _id: req.params.id },
          {
            $set: {
              commentDescription: req.body.commentDescription,
            },
          }
        );
      res.redirect(req.body.redirect)
      }
    } catch (err) {
      console.error(err)
      return res.render('error')
    }
   })
  
  
  
  // delete a post
  // @route   DELETE comment/:id
  router.delete("/:id", ensureAuthenticated, async (req, res) => {
    try {
      const comment = await Comment.findById(req.params.id);
      if (!comment) {
        return res.render("404");
      }
  
      if (comment.user != req.user.id) {
        res.render("error");
      } else {
        await Comment.deleteOne({ _id: req.params.id });
        res.redirect(req.body.redirect);
      }
    } catch (err) {
      console.error(err);
      return res.render("error");
    }
  });

  // likes for the comment section
  router.post("/like", ensureAuthenticated , async (req, res) => {
    const userLiked = await Comment.findOne({_id: req.body.commentId, 'likes.user': req.body.userId});
    if(userLiked){
      // edit the like value
      const likeCondition = userLiked.likes.findIndex(x => x.user == req.body.userId)
      await Comment.updateOne(
        { _id: req.body.commentId, 'likes.user': req.body.userId}, 
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
      await Comment.updateOne(
        { _id: req.body.commentId}, 
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
 