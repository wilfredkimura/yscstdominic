const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const db = require('../db');

const syncUser = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        if (!userId) return next();

        // Check if user exists in local DB
        const result = await db.query('SELECT * FROM users WHERE clerk_id = $1', [userId]);

        if (result.rows.length === 0) {
            // User doesn't exist, we might need more info from Clerk or just create a stub
            // Ideally, we'd use a webhook for full profile sync, but a stub works for now
            await db.query('INSERT INTO users (clerk_id, email, role) VALUES ($1, $2, $3)', [
                userId,
                '', // Email would ideally come from req.auth or Clerk API
                'Registered User'
            ]);
        }

        next();
    } catch (error) {
        console.error('Error syncing user:', error);
        next();
    }
};

module.exports = {
    requireAuth: ClerkExpressRequireAuth(),
    syncUser
};
