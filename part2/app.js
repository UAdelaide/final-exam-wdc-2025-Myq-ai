const session = require('express-session'); // New addition: Introduce the session module
const express = require('express');
const path = require('path');
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

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;