// backend/src/routes/users.js
const express = require('express');
const auth    = require('../middleware/auth');
const userCtl = require('../controllers/userController');

const router = express.Router();

router.post('/signup', userCtl.signup);
router.post('/login',  userCtl.login);
router.get ('/me',     auth, userCtl.me);   // new

module.exports = router;
