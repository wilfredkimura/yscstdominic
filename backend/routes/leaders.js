const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all leaders (Public)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leaders WHERE deleted_at IS NULL ORDER BY rank ASC, name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create leader (Admin only)
router.post('/', authMiddleware, adminRequired, async (req, res) => {
    const { name, role, image_url, bio, rank } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO leaders (name, role, image_url, bio, rank) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, role, image_url, bio, rank || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update leader (Admin only)
router.put('/:id', authMiddleware, adminRequired, async (req, res) => {
    const { name, role, image_url, bio, rank } = req.body;
    try {
        const result = await db.query(
            'UPDATE leaders SET name = $1, role = $2, image_url = $3, bio = $4, rank = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 AND deleted_at IS NULL RETURNING *',
            [name, role, image_url, bio, rank || 0, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Leader not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft delete leader (Admin only)
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE leaders SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Leader not found' });
        res.json({ message: 'Leader deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
