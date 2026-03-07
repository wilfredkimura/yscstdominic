const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    const { q } = req.query;

    try {
        const searchTerm = q && q.trim().length > 0 ? `%${q.trim()}%` : null;

        // Search/Discovery Blogs
        let blogsQuery = `
            SELECT 
                id, 
                title, 
                excerpt as subtitle, 
                slug, 
                created_at as date,
                category as tag,
                'blog' as type
            FROM blog_posts 
            WHERE deleted_at IS NULL
            AND is_published = TRUE
        `;
        const blogsParams = [];

        if (searchTerm) {
            blogsQuery += ` AND (title ILIKE $1 OR excerpt ILIKE $1 OR content::text ILIKE $1 OR category ILIKE $1)`;
            blogsParams.push(searchTerm);
            blogsQuery += ` LIMIT 5`;
        } else {
            blogsQuery += ` ORDER BY created_at DESC LIMIT 3`;
        }

        // Search/Discovery Events
        let eventsQuery = `
            SELECT 
                id, 
                title, 
                description as subtitle, 
                id::text as slug, 
                event_date as date,
                category as tag,
                'event' as type
            FROM events 
            WHERE deleted_at IS NULL
        `;
        const eventsParams = [];

        if (searchTerm) {
            eventsQuery += ` AND (title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1 OR category ILIKE $1)`;
            eventsParams.push(searchTerm);
            eventsQuery += ` LIMIT 5`;
        } else {
            eventsQuery += ` ORDER BY event_date DESC LIMIT 3`;
        }

        const [blogsRes, eventsRes] = await Promise.all([
            db.query(blogsQuery, blogsParams),
            db.query(eventsQuery, eventsParams)
        ]);

        const results = [...blogsRes.rows, ...eventsRes.rows].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        res.json(results);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

module.exports = router;
