const bCrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('./models');

module.exports = function (passport) {
  // Passport needs to be able to serialize and deserialize users to support persistent login sessions
  passport.serializeUser(function (user, done) {
    console.log('serializing user:', user.email);
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
      if (user) console.log('deserializing user:', user.email);
      done(err, user);
    });
  });

  passport.use(
    'login',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      function (req, email, password, done) {
        // check in mongo if a user with email exists or not
        User.findOne({ email: email }, function (err, user) {
          // In case of any error, return using the done method
          if (err) return done(err);
          // email does not exist, log the error and redirect back
          if (!user) {
            console.log('User Not Found with email ' + email);
            return done(null, false);
          }
          // User exists but wrong password, log the error
          if (!isValidPassword(user, password)) {
            console.log('Invalid Password');
            return done(null, false); // redirect back to login page
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
        passReqToCallback: true, // allows us to pass back the entire request to the callback
      },
      function (req, email, password, done) {
        findOrCreateUser = function () {
          // find a user in mongo with provided email
          User.findOne({ email: email }, function (err, user) {
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
