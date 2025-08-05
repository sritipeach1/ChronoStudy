// backend/src/controllers/roomController.js
const db = require('../db');

//1
// Create a room
exports.createRoom = async (req, res) => {
  const { name, is_public = true } = req.body;
  const userId = req.userId; // Get user ID from the auth middleware

  try {
    const result = await db.query(
      'INSERT INTO rooms (name, is_public, owner_id) VALUES ($1, $2, $3) RETURNING id, name, is_public',
      [name, is_public, userId]
    );
    const room = result.rows[0];
    res.status(201).json(room);
  } catch (err) {
    console.error('Error creating room:', err);
    res.status(500).json({ error: 'Room creation failed' });
  }
};

// List all rooms
exports.listRooms = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM rooms');
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Join a room
exports.joinRoom = async (req, res) => {
  const roomId = req.params.id;
  const userId = req.userId; // From the JWT

  try {
    const result = await db.query(
      'INSERT INTO room_members (user_id, room_id) VALUES ($1, $2) RETURNING user_id, room_id',
      [userId, roomId]
    );
    const member = result.rows[0];
    res.status(200).json({ message: 'Joined room successfully', member });
  } catch (err) {
    console.error('Error joining room:', err);
    res.status(500).json({ error: 'Joining room failed' });
  }
};



// 2

/// Start Pomodoro  ────────────────────────────────────────────────
exports.startPomodoro = async (req, res) => {
  const userId   = req.userId;
  const { room_id } = req.body;
  const start    = new Date();

  try {
    const { rows } = await db.query(
      `INSERT INTO pomodoro_sessions
         (user_id, room_id, mode, start_time, end_time)
       VALUES ($1,$2,'work',$3,NULL)
       RETURNING id, start_time`,
      [userId, room_id, start]
    );
    res.status(201).json({ message: 'Pomodoro session started', session: rows[0] });
  } catch (err) {
    console.error('Error starting Pomodoro session:', err);
    res.status(500).json({ error: 'Pomodoro session start failed' });
  }
};

// Stop Pomodoro  ────────────────────────────────────────────────
exports.stopPomodoro = async (req, res) => {
  const { session_id } = req.body;
  const end = new Date();

  try {
    const { rows } = await db.query(
      `UPDATE pomodoro_sessions
         SET end_time = $1, mode = 'break'
       WHERE id = $2
       RETURNING id, start_time, end_time, mode`,
      [end, session_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Session not found' });
    res.json({ message: 'Pomodoro session stopped', session: rows[0] });
  } catch (err) {
    console.error('Error stopping Pomodoro session:', err);
    res.status(500).json({ error: 'Pomodoro session stop failed' });
  }
};


