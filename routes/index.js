const express = require("express");
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");
const Post = require("../model/Posts");

/* GET home page. */
router.get("/", forwardAuthenticated, (req, res) => {
  res.render("index", { title: "userApp" });
});

// Dashboard get user posts
router.get("/dashboard", ensureAuthenticated, async (req, res) => {
  const userPosts = await Post.find({ user: req.user.id }).populate('user').exec();
  res.render("dashboard", {
    user: req.user,
    posts: userPosts.reverse(),
  });
});

// Get posts for home page
router.get("/home", ensureAuthenticated, async (req, res) => {
   const posts = await Post.find({status: true}).populate('user').exec();
  res.render("home", {
    user: req.user,
    posts: posts.reverse(),
  });
  //console.log(posts[0].user._id == req.user.id);
});

// view a profiles posts
router.get("/post/profile/:id", ensureAuthenticated, async (req, res) => {
  if(req.params.id == req.user.id){
    res.redirect('/dashboard')
  }else{
  const userPosts = await Post.find({ user: req.params.id, status: true}).populate('user').exec();
  res.render("viewProfile", {
    user: req.user,
    posts: userPosts.reverse(),
  });
}  
});

// add a post and redirect to home or posts
router.post("/post", ensureAuthenticated, async (req, res) => {
  try {
    if (req.user) {
      if (req.body.description) {
        req.body.user = req.user;
        await Post.create(req.body);
        res.redirect(req.body.URL); // we'll change this late
      } else {
        req.flash("error_msg", "Please provide a description");
        res.redirect(req.body.URL); // we'll change this late
      }
    }
  } catch (err) {
    console.error(err);
  }
});

// @desc    Show edit page
// @route   GET /stories/edit/:id
router.get('/post/edit/:id', ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.id,
    })

    if (!post) {
      return res.render('404')
    }

    if (post.user != req.user.id) {
      res.redirect('/home')
    } else {
      res.render('editPost', {
        user : req.user,
        post,
      })
    }
  } catch (err) {
    console.error(err)
    return res.render('error')
  }
})

// Update post
// PUT /post/:id
router.put('/post/:id', ensureAuthenticated, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id)

    if (!post) {
      return res.render('404')
    }

    if (post.user != req.user.id) {
      res.redirect('/home')
    } else {
      post = await Post.findOneAndUpdate({ _id: req.params.id }, req.body, {
        new: true,
        runValidators: true,
      })

    res.redirect('/dashboard')
    }
  } catch (err) {
    console.error(err)
    return res.render('error')
  }
})



// delete a post
// @route   DELETE post/:id
router.delete("/post/:id", ensureAuthenticated, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.render("404");
    }

    if (post.user != req.user.id) {
      res.render("error");
    } else {
      await Post.remove({ _id: req.params.id });
      res.redirect(req.body.redirect);
    }
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});

module.exports = router;
