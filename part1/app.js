const express = require('express');
const mysql = require('')

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
      JOIN Dogs d
        ON wr.dog_id = d.dog_id
      JOIN Users u
        ON d.owner_id = u.user_id
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

app.get('/api/walkers/summary', (req, res) => {
  try {
    const sql = `
      SELECT
        u.username                  AS walker_username,
        COUNT(wr.rating)            AS total_ratings,
        ROUND(AVG(wr.rating), 2)    AS average_rating,
        COUNT(wr.request_id)        AS completed_walks
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



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
