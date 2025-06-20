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
  fs.readFile(path.join(__dirname, 'public/index.html'), 'utf8', (err, html) => {
    if (err) {
      return res.status(500).send('Failed to load homepage');
    }

    // Inject user information as a JS script and insert it into the page
    const userScript = `
      <script>
        window.loggedInUser = ${JSON.stringify(req.session.user || null)};
      </script>
    `;

    const modifiedHtml = html.replace('</head>', `${userScript}</head>`);
    res.send(modifiedHtml);
  });
});



// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;