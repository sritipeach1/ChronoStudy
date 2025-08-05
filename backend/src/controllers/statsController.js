// backend/src/controllers/statsController.js
const db = require('../db');

/**
 * GET /api/rooms/stats/focus
 * Returns total focus minutes and whether the user logged focus today.
 */
exports.getFocusStats = async (req, res) => {
  const userId = req.userId;

  try {
    /* 1. total minutes across finished sessions */
    const totalQ = await db.query(
      `SELECT COALESCE(
           SUM(EXTRACT(EPOCH FROM (end_time - start_time)))/60, 0
         ) AS minutes
         FROM pomodoro_sessions
        WHERE user_id = $1
          AND end_time IS NOT NULL`,
      [userId]
    );
    const totalMinutes = parseFloat(totalQ.rows[0].minutes);

    /* 2. simple “streak today” flag */
    const streakQ = await db.query(
      `SELECT 1
         FROM pomodoro_sessions
        WHERE user_id = $1
          AND end_time IS NOT NULL
          AND end_time::date = CURRENT_DATE
        LIMIT 1`,
      [userId]
    );
    const streakToday = streakQ.rows.length > 0;

    res.json({ totalMinutes, streakToday });
  } catch (err) {
    console.error('Error fetching focus stats:', err);
    res.status(500).json({ error: 'Failed to fetch focus stats' });
  }
};
