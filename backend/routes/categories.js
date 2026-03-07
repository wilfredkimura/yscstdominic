const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all categories
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM blog_categories ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create category (Admin only)
router.post('/', authMiddleware, adminRequired, async (req, res) => {
    const { name, slug } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO blog_categories (name, slug) VALUES ($1, $2) RETURNING *',
            [name, slug]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Category or slug already exists' });
        res.status(500).json({ error: err.message });
    }
});

// Delete category (Admin only)
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM blog_categories WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });
        res.json({ message: 'Category deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
