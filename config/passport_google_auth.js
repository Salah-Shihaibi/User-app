const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../model/Users");

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/users/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          image: profile.photos[0].value,
          email: profile.emails[0].value,
        });

        try {
          let user = await User.findOne({ googleId: profile.id });
          let userEmail = await User.findOne({
            email: profile.emails[0].value,
          });

          if (user) {
            done(null, user);
          } else if (userEmail) {
            await User.updateOne(
              { email: profile.emails[0].value },
              {
                $set: {
                  googleId: profile.id,
                },
              }
            );
            done(null, userEmail);
          } else {
            user = await newUser.save();
            done(null, user);
          }
        } catch (err) {
          console.error(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
  });
};
