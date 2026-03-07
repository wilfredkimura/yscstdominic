const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all blogs (Public)
router.get('/', async (req, res) => {
    const { featured, limit, category } = req.query;
    try {
        let query = 'SELECT * FROM blog_posts WHERE deleted_at IS NULL';
        const params = [];

        if (featured === 'true') {
            query += ' AND is_featured = TRUE';
        }

        if (category) {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }

        query += ' ORDER BY created_at DESC';

        if (limit) {
            params.push(parseInt(limit));
            query += ` LIMIT $${params.length}`;
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get single blog (Public)
router.get('/:slug', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM blog_posts WHERE slug = $1 AND deleted_at IS NULL', [req.params.slug]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create blog (Admin only)
router.post('/', authMiddleware, adminRequired, async (req, res) => {
    const { title, slug, excerpt, content, category, image_url, author, is_featured } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO blog_posts (title, slug, excerpt, content, category, image_url, author, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [title, slug, excerpt, content, category, image_url, author, is_featured || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Slug already exists' });
        res.status(500).json({ error: err.message });
    }
});

// Update blog (Admin only)
router.put('/:id', authMiddleware, adminRequired, async (req, res) => {
    const { title, slug, excerpt, content, category, image_url, author, is_featured } = req.body;
    try {
        const result = await db.query(
            'UPDATE blog_posts SET title = $1, slug = $2, excerpt = $3, content = $4, category = $5, image_url = $6, author = $7, is_featured = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 AND deleted_at IS NULL RETURNING *',
            [title, slug, excerpt, content, category, image_url, author, is_featured || false, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Slug already exists' });
        res.status(500).json({ error: err.message });
    }
});

// Soft delete blog (Admin only)
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE blog_posts SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Increment blog view count
router.post('/view/:slug', async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE blog_posts SET views = views + 1 WHERE slug = $1 AND deleted_at IS NULL RETURNING views',
            [req.params.slug]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ views: result.rows[0].views });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
