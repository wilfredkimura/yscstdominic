const { users } = require('@clerk/clerk-sdk-node');
const db = require('../db');

// This is a bridge middleware that uses Clerk but maintains the interface
const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Authentication required' });

    try {
        // In Express, Clerk middleware usually handles this, 
        // but for a bridge, we can use the SDK to verify the token or session
        // However, the easiest way with @clerk/clerk-sdk-node is to use their helper
        // For this implementation, we assume the token is a Clerk JWT

        // Let's use the users.getUser to verify the user exists and get metadata
        // Note: Real implementation would verify the JWT signature first
        // But ClerkExpressRequireAuth is preferred. Let's stick to the plan of wrapping.

        // If we want to keep it simple, we'll use the clerkAuth middleware in index.js
        // and this just checks if req.auth is present.
        if (req.auth) {
            req.user = {
                id: req.auth.userId,
                role: req.auth.claims?.metadata?.role || 'Registered User'
            };
            return next();
        }

        res.status(401).json({ message: 'Invalid or expired session' });
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed' });
    }
};

const adminRequired = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};

module.exports = {
    authMiddleware,
    adminRequired
};
