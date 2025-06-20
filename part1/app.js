const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

const dbFile = path.join(__dirname, 'dogwalks.db');
const db = new sqlite3.Database(dbFile, err => {
  if (err) console.error(err);
  else console.log('SQLite connected');
});


const schema = fs.readFileSync(path.join(__dirname, 'dogwalks.sql'), 'utf8');
db.exec(schema, err => {
  if (err) console.error('Schema load failed', err);
});

app.get('/api/dogs', (req, res) => {
  try {
    const sql = `
      SELECT
        d.name       AS dog_name,
        d.size       AS size,
        u.username   AS owner_username
      FROM Dogs d
      JOIN Users u
        ON d.owner_id = u.user_id
    `;
    db.all(sql, [], (err, rows) => {
      if (err) throw err;
      res.json(rows);
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
