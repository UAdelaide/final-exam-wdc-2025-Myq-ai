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
app.get('/', (req, res) => {
  if (req.session.user) {
    // 已登录，根据用户角色跳转到对应页面
    return res.redirect(
      req.session.user.role === 'owner'
        ? '/owner-dashboard.html'
        : '/walker-dashboard.html'
    );
  }
  // 未登录，显示首页（含登录表单）
  res.sendFile(path.join(__dirname, 'public/index.html'));
});


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;