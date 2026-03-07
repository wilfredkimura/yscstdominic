const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Public route to track a page view
router.post('/track', async (req, res) => {
    try {
        const { path } = req.body;
        const userAgent = req.headers['user-agent'] || 'Unknown';

        if (!path) return res.status(400).json({ error: 'Path is required' });

        await db.query(
            'INSERT INTO page_views (path, user_agent) VALUES ($1, $2)',
            [path, userAgent]
        );
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Failed to track page view:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Admin area route to get general analytics aggregated overview
router.get('/overview', authMiddleware, adminRequired, async (req, res) => {
    try {
        const { period = 'day' } = req.query; // 'hour', 'day', 'week', 'month', 'year'

        // Define truncation for PostgreSQL
        let interval = 'day';
        let limit = 30;

        switch (period) {
            case 'hour': interval = 'hour'; limit = 24; break;
            case 'day': interval = 'day'; limit = 30; break;
            case 'week': interval = 'week'; limit = 12; break;
            case 'month': interval = 'month'; limit = 12; break;
            case 'year': interval = 'year'; limit = 5; break;
        }

        const [
            viewsRes,
            eventsRes,
            blogsRes,
            usersRes,
            rsvpsRes,
            timeSeriesRes,
            topPagesRes,
            recentActivityRes
        ] = await Promise.all([
            // Total page views
            db.query('SELECT COUNT(*)::INT as total FROM page_views'),
            // Upcoming events
            db.query('SELECT COUNT(*)::INT as total FROM events WHERE event_date >= CURRENT_DATE AND deleted_at IS NULL'),
            // Total Blog Posts
            db.query('SELECT COUNT(*)::INT as total FROM blog_posts WHERE deleted_at IS NULL'),
            // Total standard Users
            db.query("SELECT COUNT(*)::INT as total FROM users WHERE role = 'User'"),
            // Total RSVPs across all time
            db.query('SELECT COUNT(*)::INT as total FROM event_rsvps'),
            // Time series data
            db.query(`
                SELECT date_trunc($1, created_at) as label, COUNT(*)::INT as views 
                FROM page_views 
                GROUP BY label 
                ORDER BY label DESC 
                LIMIT $2
            `, [interval, limit]),
            // Get top 5 pages
            db.query(`
                SELECT path, COUNT(*)::INT as views 
                FROM page_views 
                GROUP BY path 
                ORDER BY views DESC 
                LIMIT 5
            `),
            // Recent traffic
            db.query(`
                SELECT path, created_at
                FROM page_views
                ORDER BY created_at DESC
                LIMIT 10
            `)
        ]);

        res.json({
            metrics: {
                total_views: parseInt(viewsRes.rows[0].total),
                upcoming_events: parseInt(eventsRes.rows[0].total),
                total_blogs: parseInt(blogsRes.rows[0].total),
                total_users: parseInt(usersRes.rows[0].total),
                total_rsvps: parseInt(rsvpsRes.rows[0].total),
            },
            time_series: timeSeriesRes.rows.reverse(),
            top_pages: topPagesRes.rows,
            recent_activity: recentActivityRes.rows
        });
    } catch (err) {
        console.error('Failed to fetch analytics overview:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
