const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require('../db'); // Ensure to import your db connection

// Signup logic (hash password and save user)
const signup = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if the user already exists
    try {
        const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
        if (result.rows.length > 0) {
            return res.status(400).send("User already exists");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to DB
        const userResult = await db.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );
        const user = userResult.rows[0];

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id }, // Use the user's ID from the DB
            process.env.JWT_SECRET, // This is the secret in your .env
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // Send response with user info and token
        res.status(201).json({ user: { id: user.id, name: user.name, email: user.email }, token });

    } catch (err) {
        console.error('Error signing up:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
};

// Login logic (compare password and generate JWT)
const login = async (req, res) => {
    const { email, password } = req.body;

    // Find user by email and compare passwords
    try {
        const result = await db.query('SELECT * FROM users WHERE email=$1', [email]);
        const user = result.rows[0];
        
        if (!user) return res.status(400).send("User not found!");

        // Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send("Invalid password!");

        // Create JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send response with user info and token
        res.json({ user: { id: user.id, name: user.name, email: user.email }, token });

    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).json({ error: 'Login failed' });
    }
};

module.exports = { signup, login };

// backend/src/middleware/auth.js
const JWT_SECRET = process.env.JWT_SECRET; // Read JWT secret from the .env

module.exports = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).send('Missing token');
  const token = auth.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_SECRET); // You can access jwt directly
    req.userId = payload.userId; // Attach userId to request object
    next(); // Pass control to the next handler (e.g., createRoom)
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).send('Invalid token');
  }
};

