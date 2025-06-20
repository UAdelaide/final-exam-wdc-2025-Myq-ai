const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port =8080;

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'DogWalkService'
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
