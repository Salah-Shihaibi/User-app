const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
// Load User model
const User = require("../model/Users");
const Post = require("../model/Posts");

const { ensureAuthenticated, forwardAuthenticated } = require("../config/auth");

// Login Page
router.get("/login", forwardAuthenticated, (req, res) => res.render("login"));

// Register Page
router.get("/register", forwardAuthenticated, (req, res) =>
  res.render("register")
);

// Register
router.post("/register", forwardAuthenticated, async (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please enter all fields" });
  }

  if (password != password2) {
    errors.push({ msg: "Passwords do not match" });
  }

  if (password.length < 6) {
    errors.push({ msg: "Password must be at least 6 characters" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  } else {
    try {
      const userEmail = await User.findOne({ email: email });
      const userName = await User.findOne({ name: name });
      if (userEmail && userEmail.password ) {
        errors.push({ msg: "Email already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else if (userEmail) {
        const passwordhash = password;
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(passwordhash, salt, async (err, hash) => {
            if (err) throw err;
            await User.updateOne(
              { email: email},
              {
                $set: {
                  password: hash,
                },
              }
            );
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/users/login");
          });
        });
      } else if (userName) {
        errors.push({ msg: "Name already exists" });
        res.render("register", {
          errors,
          name,
          email,
          password,
          password2,
        });
      } else {
        const newUser = new User({
          name,
          email,
          password,
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, async (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            await newUser.save();
            req.flash("success_msg", "You are now registered and can log in");
            res.redirect("/users/login");
          });
        });
      }
    } catch (err) {
      console.log(err);
      res.json({ msg: err });
    }
  }
});

// Login Locally
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// login with Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

//Google user callback
//GET /user/google/callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/users/login",
    failureFlash: true,
  }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "You are logged out");
  res.redirect("/users/login");
});

// delete a user
// @route   DELETE user/:id
router.delete("/:id", ensureAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.render("404");
    }

    if (user._id != req.user.id) {
      res.render("error");
    } else {
      await Post.deleteMany({ user: req.params.id})
      await User.deleteOne({ _id: req.params.id });
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    return res.render("error");
  }
});

//edit users picture
module.exports = router;
