const express =require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const User = require('./models/user')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();
const MongoStore = require('connect-mongo');

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use('/uploads', express.static('uploads'))

// Load environment variables from the .env file
require('dotenv').config();

// Set the strictQuery option to false
mongoose.set('strictQuery', false);

// Connect to the MongoDB database
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

  app.use(session({
    secret: 'my-secret-key',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        ttl: 24 * 60 * 60 // TTL (time-to-live) in seconds
    })
}));

  app.use(session({ secret: 'my-secret-key', resave: true, saveUninitialized: true }));
  app.use(passport.initialize());
  app.use(passport.session());
  
const indexRoute = require('./routes/index')
const dashboardRoute = require('./routes/dashboard')

app.use('/',indexRoute);
app.use('/dashboard',dashboardRoute);

app.listen(9000, () => {
    console.log("The server is running on http://localhost:9000/");
});
