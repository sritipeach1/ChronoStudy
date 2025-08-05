// backend/src/controllers/userController.js
const db       = require('../db');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

/* ── POST /api/signup ─────────────────────────────────────────── */
exports.signup = async (req, res) => {
  const { username, email, password, avatar } = req.body;

  if (!/^[A-Za-z0-9_]{3,15}$/.test(username))
      return res.status(400).send('Bad username');
  if (!Number.isInteger(avatar) || avatar < 1 || avatar > 8)
      return res.status(400).send('Bad avatar');

  const dup = await db.query(
    'SELECT 1 FROM users WHERE username=$1 OR email=$2',
    [username, email]
  );
  if (dup.rows.length) return res.status(400).send('Username or email exists');

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await db.query(
    `INSERT INTO users (username, email, password, avatar)
       VALUES ($1,$2,$3,$4)
     RETURNING id, username, avatar`,
    [username, email, hash, avatar]
  );
  const user  = rows[0];
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn:'1h' });
  res.status(201).json({ user, token });
};

/* ── POST /api/login ──────────────────────────────────────────── */
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE email=$1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error:'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)   return res.status(401).json({ error:'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn:'1h' });
    res.json({
      user : { id:user.id, username:user.username, avatar:user.avatar },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error:'Login failed' });
  }
};

/* ── GET /api/me ──────────────────────────────────────────────── */
exports.me = async (req, res) => {
  const { rows } = await db.query(
    'SELECT id, username, avatar FROM users WHERE id=$1',
    [req.userId]
  );
  res.json(rows[0]);
};
