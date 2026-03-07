const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all gallery items (Optionally filtered by album)
router.get('/', async (req, res) => {
    const { album_id } = req.query;
    try {
        let query = 'SELECT id, image_url, caption as title, album_id, created_at FROM gallery_images WHERE deleted_at IS NULL';
        const params = [];

        if (album_id) {
            params.push(album_id);
            query += ` AND album_id = $${params.length}`;
        }

        query += ' ORDER BY created_at DESC';
        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all albums
router.get('/albums', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM albums WHERE deleted_at IS NULL ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create album (Admin only)
router.post('/albums', authMiddleware, adminRequired, async (req, res) => {
    const { title, description, cover_image_url } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO albums (title, description, cover_image_url) VALUES ($1, $2, $3) RETURNING *',
            [title, description, cover_image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create gallery item
router.post('/', authMiddleware, adminRequired, async (req, res) => {
    const { image_url, caption, album_id } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO gallery_images (image_url, caption, album_id) VALUES ($1, $2, $3) RETURNING *',
            [image_url, caption, album_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete gallery item
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query('UPDATE gallery_images SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Gallery item not found' });
        res.json({ message: 'Gallery item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
