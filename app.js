//const createError = require('http-errors');
const express = require('express');
const mongoose = require("mongoose");
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const dotenv = require('dotenv');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Load config
dotenv.config({ path: './config/config.env' })

const app = express();

// passport config
require('./config/passport')(passport);
require('./config/passport_google_auth')(passport);

// connect to db
mongoose.connect(
  process.env.MONGO_URL,
  () => console.log("DB connected")
);

// view engine setup
app.use(expressLayouts);
app.set('layout', './layouts/layout')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//Express session
app.use(
  session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
  })
);
// Connect flash
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// Global Flash variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).render('404')
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
