const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
const Post = require('../model/Posts')


/* GET home page. */
router.get('/', forwardAuthenticated, (req, res) => {
  res.render('index', { title: 'userApp' });
});

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dashboard', {
    user: req.user
  })
);

// Get posts for home page
router.get('/home', ensureAuthenticated, (req, res) => {
  res.render('home', {
    user: req.user
  })
});

// add a post and redirect to home or posts
router.post('/post', ensureAuthenticated, async (req, res) => {
  try {
    if(req.user){
      if(req.body.description){
        req.body.user = req.user.id
        await Post.create(req.body)
        res.redirect(req.body.URL)// we'll change this late
      }else{
        req.flash("error_msg", "Please provide a description");
        res.redirect(req.body.URL)// we'll change this late
      }  
    }
  } catch (err) {
    console.error(err)
  }
})


module.exports = router;