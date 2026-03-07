const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

// Register
router.post('/register', async (req, res) => {
    const { email, password, fullName } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
            [email, hashedPassword, fullName, 'Registered User']
        );
        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        const { password_hash, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Me
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await db.query('SELECT id, email, full_name, role FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Get all users (Admin)
router.get('/users', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user (Admin)
router.put('/users/:id', authMiddleware, adminRequired, async (req, res) => {
    const { full_name, role } = req.body;
    try {
        const result = await db.query(
            'UPDATE users SET full_name = $1, role = $2 WHERE id = $3 RETURNING id, full_name, email, role',
            [full_name, role, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user (Admin - soft delete would be better but let's do hard delete or toggle status if column exists)
router.delete('/users/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        // For safety, let's just make them a restricted role or similar if we don't have a status column.
        // But the user asked for delete, so let's do delete.
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
