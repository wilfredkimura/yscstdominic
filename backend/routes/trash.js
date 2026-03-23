const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all soft-deleted items across categories
router.get('/', authMiddleware, adminRequired, async (req, res) => {
    try {
        const blogsPromise = db.query('SELECT id, title, deleted_at, \'blog\' as type FROM blog_posts WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC');
        const eventsPromise = db.query('SELECT id, title, deleted_at, \'event\' as type FROM events WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC');

        const [blogsRes, eventsRes] = await Promise.all([blogsPromise, eventsPromise]);

        res.json({
            blogs: blogsRes.rows,
            events: eventsRes.rows
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Restore an item
router.post('/restore', authMiddleware, adminRequired, async (req, res) => {
    const { id, type } = req.body;

    if (!id || !type) return res.status(400).json({ error: 'Missing id or type' });

    try {
        let table;
        if (type === 'blog') table = 'blog_posts';
        else if (type === 'event') table = 'events';
        else return res.status(400).json({ error: 'Invalid type' });

        const result = await db.query(
            `UPDATE ${table} SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });

        res.json({ message: 'Item restored successfully', item: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permanently delete an item
router.delete('/:type/:id', authMiddleware, adminRequired, async (req, res) => {
    const { id, type } = req.params;

    try {
        let table;
        if (type === 'blog') table = 'blog_posts';
        else if (type === 'event') table = 'events';
        else return res.status(400).json({ error: 'Invalid type' });

        const result = await db.query(`DELETE FROM ${table} WHERE id = $1 AND deleted_at IS NOT NULL RETURNING *`, [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found in trash' });

        res.json({ message: 'Item permanently deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
