// app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs      = require('fs');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// 1) Open or create the SQLite database file
const dbFile = path.join(__dirname, 'dogwalks.db');
const db = new sqlite3.Database(dbFile, err => {
  if (err) console.error('SQLite error:', err.message);
  else    console.log('Connected to SQLite at', dbFile);
});

// 2) Initialize schema from dogwalks.sql on startup
const schema = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
db.exec(schema, err => {
  if (err) console.error('Failed to load schema:', err.message);
});

// 3) Seed some test data (INSERT OR IGNORE avoids duplicates)
db.serialize(() => {
  db.run(`
    INSERT OR IGNORE INTO Users (username,email,password_hash,role) VALUES
      ('alice123','alice@example.com','hashed123','owner'),
      ('bobwalker','bob@example.com','hashed456','walker'),
      ('carol123','carol@example.com','hashed789','owner')
  `);
  db.run(`
    INSERT OR IGNORE INTO Dogs (owner_id,name,size) VALUES
      ((SELECT user_id FROM Users WHERE username='alice123'),'Max','medium'),
      ((SELECT user_id FROM Users WHERE username='carol123'),'Bella','small')
  `);
  db.run(`
    INSERT OR IGNORE INTO WalkRequests (dog_id,requested_time,duration_minutes,location,status) VALUES
      ((SELECT dog_id FROM Dogs WHERE name='Max'),'2025-06-10 08:00:00',30,'Parklands','open')
  `);
});

// 4) /api/dogs
app.get('/api/dogs', (req, res) => {
  try {
    const sql = `
      SELECT d.name       AS dog_name,
             d.size       AS size,
             u.username   AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `;
    db.all(sql, [], (err, rows) => {
      if (err) throw err;
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5) /api/walkrequests/open
app.get('/api/walkrequests/open', (req, res) => {
  try {
    const sql = `
      SELECT
        wr.request_id,
        d.name              AS dog_name,
        wr.requested_time,
        wr.duration_minutes,
        wr.location,
        u.username          AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d   ON wr.dog_id  = d.dog_id
      JOIN Users u  ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `;
    db.all(sql, [], (err, rows) => {
      if (err) throw err;
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6) /api/walkers/summary
app.get('/api/walkers/summary', (req, res) => {
  try {
    const sql = `
      SELECT
        u.username                 AS walker_username,
        COUNT(wr.rating)           AS total_ratings,
        ROUND(AVG(wr.rating),2)    AS average_rating,
        COUNT(wr.request_id)       AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings wr
        ON u.user_id = wr.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `;
    db.all(sql, [], (err, rows) => {
      if (err) throw err;
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 7) Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
