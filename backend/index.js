const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Routes
const blogRoutes = require('./routes/blog');
const eventRoutes = require('./routes/events');
const galleryRoutes = require('./routes/gallery');
const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/config');
const adminRoutes = require('./routes/admin');
const categoryRoutes = require('./routes/categories');
const eventCategoryRoutes = require('./routes/event_categories');
const leaderRoutes = require('./routes/leaders');
const commentRoutes = require('./routes/comments');
const resourceRoutes = require('./routes/resources');
const analyticsRoutes = require('./routes/analytics');
const searchRoutes = require('./routes/search');
const trashRoutes = require('./routes/trash');

// Middleware
app.use(helmet());
app.use(cors());
// Webhooks (Must be before express.json() for raw body parsing)
const webhookRoutes = require('./routes/webhooks');
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
const { requireClerkAuth } = require('./middleware/clerkAuth');
app.use(morgan('dev'));

// Clerk Session Middleware (Optional: applies to ALL routes, or just some)
// For now, let's use it selectively in our bridge customAuth or globally
// If globally, it might interfere with public routes if not configured correctly.
// Let's use the loose version or just include it here.
const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
app.use(ClerkExpressWithAuth());

// Route Registration
app.use('/api/blog/categories', categoryRoutes);
app.use('/api/events/categories', eventCategoryRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/leaders', leaderRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/admin/trash', trashRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'YSC St. Dominic API is running' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
