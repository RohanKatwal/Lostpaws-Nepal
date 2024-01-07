const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const User = require('./models/user');
require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;

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
  

  // Google Strategy for handling Google OAuth 2.0 authentication
  passport.use(new GoogleStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: process.env.callbackURL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const userByEmail = await User.findOne({ email: profile.emails[0].value });
  
      if (userByEmail) {
        // If user already exists with the email, update Google ID
        if (!userByEmail.googleId) {
          userByEmail.googleId = profile.id;
          await userByEmail.save();
          return done(null, userByEmail);
        } else {
          // User already has a Google ID, return the user
          return done(null, userByEmail);
        }
      } else {
        // If user doesn't exist, create a new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          profileImage: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : 'image/default-profile.png',
        });
  
        await newUser.save();
        return done(null, newUser);
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
    authenticateGoogle: passport.authenticate('google', { scope: ['profile', 'email'] }),
  };