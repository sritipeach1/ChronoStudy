// backend/src/routes/rooms.js
const express = require('express');
const roomController = require('../controllers/roomController');  // Import the entire controller as an object
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');
const router = express.Router();

// Debugging: Log the functions from roomController
console.log('Imported controller functions:', roomController);

// POST /rooms: Create a new room
router.post('/', auth, roomController.createRoom);

// GET /rooms: List all rooms
router.get('/', auth, roomController.listRooms);

// POST /rooms/:id/join: Join a specific room
router.post('/:id/join', auth, roomController.joinRoom);

// --- New routes for Pomodoro timer ---
router.post('/pomodoro/start', auth, roomController.startPomodoro);  // Start Pomodoro session
router.post('/pomodoro/stop', auth, roomController.stopPomodoro);    // Stop Pomodoro session

// In backend/src/routes/rooms.js
console.log('Route handler for /pomodoro/start:', roomController.startPomodoro);
console.log('Route handler for /pomodoro/stop:', roomController.stopPomodoro);

/* focus‑stats endpoint */
router.get('/stats/focus', auth, statsController.getFocusStats);


module.exports = router;

