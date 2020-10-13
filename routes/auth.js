const router = require('express').Router();

module.exports = function (passport) {
  //sends successful login state back to frontend
  router
    .get('/success', function (req, res) {
      console.log('Authentication Successfull');
      res.send({ state: 'success', user: req.user ? req.user : null });
    })

    //sends failure login state back to frontend
    .get('/failure', function (req, res) {
      res.status(401).send({
        state: 'failure',
        user: null,
        message: 'Invalid username or password',
      });
    })

    //log in
    .post(
      '/login',
      passport.authenticate('login', {
        successRedirect: '/api/auth/success',
        failureRedirect: '/api/auth/failure',
      })
    )

    //register
    .post(
      '/register',
      passport.authenticate('register', {
        successRedirect: '/api/auth/success',
        failureRedirect: '/api/auth/failure',
      })
    )

    //is logged in
    .get('/isloggedin', function (req, res) {
      if (req.isAuthenticated()) {
        res.status(200).send({ state: 'success', user: req.user });
      } else {
        res.status(401).send({ state: 'failure', user: null });
      }
    })

    //log out
    .get('/logout', function (req, res) {
      req.session.destroy(function (err) {
        if (err)
          return res.send({ state: 'failure', message: JSON.stringify(err) });
        console.log('Session Destroyed!');
        res.send({ state: 'success', user: null, message: 'Logged out' });
      });
    });

  return router;
};
