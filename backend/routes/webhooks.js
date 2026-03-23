const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const db = require('../db');

router.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('Missing CLERK_WEBHOOK_SECRET');
        return res.status(500).json({ error: 'Missing Webhook Secret' });
    }

    // Get headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Missing svix headers' });
    }

    const payload = req.body;
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        });
    } catch (err) {
        console.error('Error verifying clerk webhook:', err);
        return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    // Handle user created
    if (evt.type === 'user.created' || evt.type === 'user.updated') {
        const { id, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses && email_addresses[0]?.email_address;
        const fullName = [first_name, last_name].filter(Boolean).join(' ');

        try {
            await db.query(
                `INSERT INTO users (clerk_id, email, full_name, profile_image_url)
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (email) DO UPDATE SET
                    clerk_id = EXCLUDED.clerk_id,
                    full_name = EXCLUDED.full_name,
                    profile_image_url = EXCLUDED.profile_image_url,
                    updated_at = CURRENT_TIMESTAMP
                 RETURNING *`,
                [id, email, fullName, image_url]
            );
            console.log(`Successfully synced clerk user ${id} to database`);
        } catch (dbErr) {
            console.error('Database error on syncing clerk user via webhook:', dbErr);
            return res.status(500).json({ error: 'Database error' });
        }
    }

    return res.status(200).json({ success: true });
});

module.exports = router;
