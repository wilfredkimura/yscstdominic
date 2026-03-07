const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get overview stats (Admin only)
router.get('/stats', authMiddleware, adminRequired, async (req, res) => {
    try {
        const stats = {};

        // Total Users
        const usersRes = await db.query('SELECT COUNT(*) FROM users');
        stats.totalUsers = parseInt(usersRes.rows[0].count);

        // Total Blog Posts
        const blogsRes = await db.query('SELECT COUNT(*) FROM blog_posts WHERE deleted_at IS NULL');
        stats.totalBlogs = parseInt(blogsRes.rows[0].count);

        // Upcoming Events
        const eventsRes = await db.query('SELECT COUNT(*) FROM events WHERE event_date >= CURRENT_TIMESTAMP AND deleted_at IS NULL');
        stats.upcomingEvents = parseInt(eventsRes.rows[0].count);

        // Prayer Requests
        const prayersRes = await db.query('SELECT COUNT(*) FROM prayer_requests WHERE deleted_at IS NULL');
        stats.totalPrayers = parseInt(prayersRes.rows[0].count);

        res.json(stats);
    } catch (err) {
        console.error('Error fetching admin stats:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
