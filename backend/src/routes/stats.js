// backend/src/routes/stats.js
const express = require('express');
const router  = express.Router();
const db      = require('../db');
const auth    = require('../middleware/auth');

router.get('/overview', auth, async (req, res) => {
  try {
    const uid = req.userId;

    /* weekly minutes (mon‑sun, last 7 days) */
    const weekRows = await db.query(
      `SELECT date_trunc('day', start_time) AS day,
              SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))/60) AS min
         FROM pomodoro_sessions
        WHERE user_id=$1
          AND start_time >= NOW() - INTERVAL '6 days'
          AND mode='work'
     GROUP BY day
     ORDER BY day`,
      [uid]
    );

    /* current streak (consecutive days with ≥1 work session) */
    const streakRows = await db.query(
      `WITH days AS (
         SELECT generate_series(
                  now()::date - INTERVAL '29 days',
                  now()::date,
                  '1 day'
                )::date AS d)
         SELECT d,
                EXISTS (
                   SELECT 1 FROM pomodoro_sessions
                    WHERE user_id=$1
                      AND mode='work'
                      AND start_time::date = d
                ) AS has_session
           FROM days
         ORDER BY d DESC`,
      [uid]
    );
    let current = 0, longest = 0, run = 0;
    streakRows.rows.forEach(r => {
      if (r.has_session) {
        run++; longest = Math.max(longest, run);
        if (run && current === 0) current = run; // first chunk is current
      } else { run = 0; }
    });

    /* work vs break total minutes */
    const distRows = await db.query(
      `SELECT mode,
              SUM(EXTRACT(EPOCH FROM (COALESCE(end_time, NOW()) - start_time))/60) AS min
         FROM pomodoro_sessions
        WHERE user_id=$1
     GROUP BY mode`,
      [uid]
    );
    const distribution = { work:0, break:0 };
    distRows.rows.forEach(r => distribution[r.mode] = Number(r.min));

    /* build weekly array Mon‑Sun */
    const weekArray = Array(7).fill(0);
    weekRows.rows.forEach(r=>{
      const idx = (new Date(r.day)).getDay(); // 0=Sun … 6=Sat
      weekArray[idx] = Number(r.min);
    });

    res.json({
      weeklyMinutes: weekArray,          // index 0‑6 Sun‑Sat
      currentStreak: current,
      longestStreak: longest,
      distribution
    });
  } catch(err){
    console.error(err);
    res.status(500).json({ error:'stats failed' });
  }
});

module.exports = router;
