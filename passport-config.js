const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const User = require('./models/user');
require('dotenv').config();

passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      // console.log(user);
      if (!user) {
        return done(null, false, { message: 'no info' });
      }
  
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
        console.log('Login successful');
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password' });
      }
    } catch (err) {
      return done(err);
    }
  }));
  

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

module.exports = {
    authenticateLocal: passport.authenticate('local', { session: false }),
  };