const { authMiddleware, adminRequired } = require('./customAuth');

module.exports = {
    requireAuth: authMiddleware,
    authMiddleware,
    adminRequired
};
