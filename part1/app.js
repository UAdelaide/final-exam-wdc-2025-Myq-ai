const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 8080;


const pool = mysql.createPool({
  host:     'localhost',
  user:     'root',
  password: '',
  database: 'DogWalkService',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * GET /api/dogs
 */
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.name       AS dog_name,
        d.size       AS size,
        u.username   AS owner_username
      FROM Dogs d
      JOIN Users u ON d.owner_id = u.user_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查询 /api/dogs 失败' });
  }
});

/**
 * GET /api/walkrequests/open
 */
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        wr.request_id,
        d.name                AS dog_name,
        wr.requested_time,
        wr.duration_minutes,
        wr.location,
        u.username            AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查询 /api/walkrequests/open 失败' });
  }
});

/**

 */
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.username AS walker_username,
        IFNULL(r.total_ratings, 0)     AS total_ratings,
        r.average_rating,
        IFNULL(w.completed_walks, 0)   AS completed_walks
      FROM Users u
      LEFT JOIN (
        SELECT
          walker_id,
          COUNT(*)         AS total_ratings,
          ROUND(AVG(rating),2) AS average_rating
        FROM Ratings
        GROUP BY walker_id
      ) r ON u.user_id = r.walker_id
      LEFT JOIN (
        SELECT
          accepted_walker_id AS walker_id,
          COUNT(*)           AS completed_walks
        FROM WalkRequests
        WHERE status = 'completed'
        GROUP BY accepted_walker_id
      ) w ON u.user_id = w.walker_id
      WHERE u.role = 'walker'
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查询 /api/walkers/summary 失败' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
