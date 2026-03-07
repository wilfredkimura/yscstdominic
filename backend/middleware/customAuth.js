const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await db.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) return res.status(401).json({ message: 'User no longer exists' });

        req.user = result.rows[0];
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const adminRequired = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = {
    authMiddleware,
    adminRequired
};
