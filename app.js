const createError = require('http-errors');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo')(session);
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

require('./bin/passport-init')(passport);

const authRouter = require('./routes/auth')(passport);
// const gqlRouter = require('./routes/graphql');

const app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    name: 'xF5FAwYuUuRfgLI2rmeWbDti',
    secret: 'IAkv7h5oir3JjuIRqdRu1ODazSqy',
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    rolling: true,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/auth', authRouter);
// app.use(
//   '/api/gql',
//   // function (req, res, next) {
//   //   console.log(req.isAuthenticated());
//   //   if (!req.isAuthenticated()) {
//   //     const err = createError(401);
//   //     res.locals.message = err.message;
//   //     res.locals.error = req.app.get('env') === 'development' ? err : {};
//   //     res.status(err.status);
//   //     res.render('error');
//   //     return;
//   //   }
//   //   console.log(req.user);
//   //   next();
//   // },
//   gqlRouter
// );

app.use(function (req, res, next) {
  console.log(req.isAuthenticated());
  if (!req.isAuthenticated()) {
    const err = createError(401);
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status);
    res.render('error');
    return;
  }
  console.log(req.user);
  next();
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
