const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');

// This middleware protects routes and attaches the clerk auth object to req.auth
const requireClerkAuth = ClerkExpressRequireAuth({
    // Add options if needed
});

const clerkAdminRequired = (req, res, next) => {
    // In a real Clerk setup, we check publicMetadata or a local database link
    // For now, we'll assume the sync middleware handles this or check metadata
    if (req.auth && req.auth.claims && req.auth.claims.metadata?.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admin access required' });
    }
};

module.exports = {
    requireClerkAuth,
    clerkAdminRequired
};
