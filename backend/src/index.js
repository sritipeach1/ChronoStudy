// backend/src/index.js
require('dotenv').config();
const express = require('express');
const db = require('./db');        // ← our new module
const app = express();
const PORT = process.env.PORT || 4000;

// simple logger so we see incoming requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('/', async (req, res) => {
  try {
    // run a test query against Postgres
    const { rows } = await db.query('SELECT NOW() AS now');
    res.json({ dbTime: rows[0].now });
  } catch (err) {
    console.error('DB error:', err);
    res.status(500).send('Database connection failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
