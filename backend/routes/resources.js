const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all resources
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM resources ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a resource (Admin)
router.post('/', authMiddleware, adminRequired, async (req, res) => {
    try {
        const { title, description, file_url, category } = req.body;
        const result = await db.query(
            'INSERT INTO resources (title, description, file_url, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, file_url, category || 'General']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a resource (Admin)
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM resources WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Resource not found' });
        res.json({ message: 'Resource deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
