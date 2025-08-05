// backend/src/index.js
require('dotenv').config();
const express = require('express');
const db = require('./db');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const roomRoutes = require('./routes/rooms');

const app = express();
const PORT = process.env.PORT || 4000;

// ————— Middleware —————
app.use(express.json());        // parse JSON bodies

/* ── serve static pixel‑art front‑end ── */
const path = require('path');
app.use(express.static(path.join(__dirname, '../../frontend')));



app.use('/api', userRoutes);    // mount your user/auth routes
app.use('/api/rooms', roomRoutes);
app.use('/api/stats', statsRoutes);

// ————— Test DB route —————
app.get('/', async (req, res) => {
  try {
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


console.log('Route for /api/rooms:', roomRoutes);
