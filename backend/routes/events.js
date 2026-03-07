const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

// Get all events
router.get('/', async (req, res) => {
    const { featured, limit } = req.query;
    try {
        let query = 'SELECT * FROM events WHERE deleted_at IS NULL';
        const params = [];

        if (featured === 'true') {
            query += ' AND is_featured = TRUE';
        }

        query += ' ORDER BY event_date DESC';

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

// Create event
router.post('/', authMiddleware, adminRequired, async (req, res) => {
    const { title, slug, date, location, description, category, image_url, is_featured } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO events (title, slug, event_date, location, description, category, image_url, is_featured) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [title, slug, date, location, description, category, image_url, is_featured || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Slug already exists' });
        res.status(500).json({ error: err.message });
    }
});

// Update event
router.put('/:id', authMiddleware, adminRequired, async (req, res) => {
    const { title, slug, date, location, description, category, image_url, is_featured } = req.body;
    try {
        const result = await db.query(
            'UPDATE events SET title = $1, slug = $2, event_date = $3, location = $4, description = $5, category = $6, image_url = $7, is_featured = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 AND deleted_at IS NULL RETURNING *',
            [title, slug, date, location, description, category, image_url, is_featured || false, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') return res.status(400).json({ error: 'Slug already exists' });
        res.status(500).json({ error: err.message });
    }
});

// Delete event
router.delete('/:id', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query('UPDATE events SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Event not found' });
        res.json({ message: 'Event deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create an RSVP for an event
router.post('/:id/rsvp', async (req, res) => {
    try {
        const { name, phone_number } = req.body;
        const eventId = req.params.id;

        // Verify event exists
        const eventRes = await db.query('SELECT * FROM events WHERE id = $1 AND deleted_at IS NULL', [eventId]);
        if (eventRes.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const result = await db.query(
            'INSERT INTO event_rsvps (event_id, name, phone_number) VALUES ($1, $2, $3) RETURNING *',
            [eventId, name, phone_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'This phone number has already RSVP\'d for this event.' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Get all RSVPs for an event (Admin Only)
router.get('/:id/rsvps', authMiddleware, adminRequired, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM event_rsvps WHERE event_id = $1 ORDER BY created_at DESC',
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
