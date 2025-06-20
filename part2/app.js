const session = require('express-session'); // New addition: Introduce the session module
const express = require('express');
const path = require('path');
const fs = require('fs'); // New addition: Used for reading HTML files and injecting user information
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(session({
  secret: 'secure-session-secret', // It can be replaced with your own random string
  resave: false,
  saveUninitialized: false
}));


app.use(express.static(path.join(__dirname, '/public')));
app.get('/', (req, res) => {
  if (req.session.user) {
    // Logged in, redirected to the corresponding page based on the user role
    return res.redirect(
      req.session.user.role === 'owner'
        ? '/owner-dashboard.html'
        : '/walker-dashboard.html'
    );
  }
  // Not logged in, the home page (including the login form) is displayed.
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;