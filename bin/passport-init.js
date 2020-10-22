const bCrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models');

module.exports = (passport) => {
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser((user, done) => {
    console.log('serializing user:', user.email);
    done(null, user.email);
  });

  passport.deserializeUser((email, done) => {
    User.findOne({ email }, (err, user) => {
      if (user) console.log('deserializing user:', user.email);
      done(err, user);
    });
  });

  passport.use(
    'update-password',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      (req, email, password, done) => {
        User.findOne({ email: req.user.email }, (err, user) => {
          if (err) return done(err);
          if (!user)
            return done(null, false, {
              message: ' User not found with email ' + email,
            });
          if (req.user.email === email || req.user.role === 'ADMIN') {
            User.findOneAndUpdate(
              { email },
              { password: createHash(password) },
              (err, updatedUser) => {
                if (err) return done(err);
                if (updatedUser) return done(null, updatedUser);
              }
            );
          }
        });
      }
    )
  );

  passport.use(
    'update-role',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      function (req, email, password, done) {
        User.findOne({ email: req.user.email }, function (err, user) {
          if (err) return done(err);
          if (!user)
            return done(null, false, {
              message: 'User not found with email ' + email,
            });
          if (user.role !== 'ADMIN')
            return done(null, false, { message: 'User not authorized!' });
          User.findOne({ email: req.body.email }, function (err, updateUser) {
            if (err) return done(err);
            if (!updateUser)
              return done(null, false, {
                message: 'User not found with email ' + req.body.email,
              });
            updateUser.role = req.body.role;
            updateUser.save({}, function (err, updatedUser) {
              if (err) return done(err);
              return done(null, updatedUser);
            });
          });
        });
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      function (req, email, password, done) {
        // check in mongo if a user with email exists or not
        User.findOne({ email }, function (err, user) {
          // In case of any error, return using the done method
          if (err) return done(err);
          // email does not exist, log the error and redirect back
          if (!user) {
            console.log('User Not Found with email ' + email);
            return done(null, false, {
              message: `User Not Found with email ${email}`,
            });
          }
          // User exists but wrong password, log the error
          if (!isValidPassword(user, password)) {
            console.log('Invalid Password');
            return done(null, false, { message: 'Invalid Password' }); // redirect back to login page
          }
          // User and password both match, return user from done method
          // which will be treated like success
          return done(null, user);
        });
      }
    )
  );

  passport.use(
    'register',
    new LocalStrategy(
      {
        usernameField: 'email',
        passReqToCallback: true,
      },
      function (req, email, password, done) {
        findOrCreateUser = function () {
          // find a user in mongo with provided email
          User.findOne({ email }, function (err, user) {
            // In case of any error, return using the done method
            if (err) {
              console.log('Error in Registration: ' + err);
              return done(err);
            }
            // already exists
            if (user) {
              console.log('User already exists with email: ' + email);
              return done(null, false);
            } else {
              // if there is no user, create the user
              const newUser = new User(req.body);

              // set the user's local credentials
              newUser.email = email;
              newUser.password = createHash(password);

              // save the user
              newUser.save(function (err) {
                if (err) {
                  console.log('Error in Saving user: ' + err);
                  throw err;
                }
                console.log(newUser.email + ' Registration succesful');
                return done(null, newUser);
              });
            }
          });
        };
        // Delay the execution of findOrCreateUser and execute the method
        // in the next tick of the event loop
        process.nextTick(findOrCreateUser);
      }
    )
  );

  var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
  };
  // Generates hash using bCrypt
  var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
  };
};
