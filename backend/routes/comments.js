const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get comments for a post (Public)
router.get('/post/:postId', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.*, u.full_name as user_name, u.profile_image_url 
             FROM comments c 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.post_id = $1 AND c.deleted_at IS NULL AND c.status = 'visible'
             ORDER BY c.is_pinned DESC, c.created_at DESC`,
            [req.params.postId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a comment (Public/Auth)
router.post('/post/:postId', async (req, res) => {
    const { content, author_name, author_email, user_id } = req.body;
    const postId = req.params.postId;
    try {
        const result = await db.query(
            'INSERT INTO comments (post_id, user_id, content, author_name, author_email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [postId, user_id || null, content, author_name || 'Anonymous', author_email || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Get all comments for moderation
router.get('/admin/all', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT c.*, b.title as post_title, u.full_name as user_name 
             FROM comments c 
             JOIN blog_posts b ON c.post_id = b.id 
             LEFT JOIN users u ON c.user_id = u.id 
             WHERE c.deleted_at IS NULL 
             ORDER BY c.created_at DESC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Toggle comment status (hidden/visible)
router.patch('/:id/status', authMiddleware, adminRequired, async (req, res) => {
    const { status } = req.body;
    try {
        const result = await db.query(
            'UPDATE comments SET status = $1 WHERE id = $2 RETURNING *',
            [status, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: Toggle pin status
router.patch('/:id/pin', authMiddleware, adminRequired, async (req, res) => {
    const { is_pinned } = req.body;
    try {
        const result = await db.query(
            'UPDATE comments SET is_pinned = $1 WHERE id = $2 RETURNING *',
            [is_pinned, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Soft delete comment
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        await db.query('UPDATE comments SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
