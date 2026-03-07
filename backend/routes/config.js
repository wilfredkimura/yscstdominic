const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all site configs
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT key, value, category FROM site_configs');
        const configs = result.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});
        res.json(configs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update site config (Admin only)
router.post('/', authMiddleware, adminRequired, async (req, res) => {
    const { key, value, category } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO site_configs (key, value, category) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET value = $2, category = $3, updated_at = CURRENT_TIMESTAMP RETURNING *',
            [key, value, category || 'general']
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
