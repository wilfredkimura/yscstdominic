const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Mock the db module
jest.mock('../db', () => ({
    query: jest.fn()
}));

const db = require('../db');
const eventsRouter = require('../routes/events');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

const JWT_SECRET = 'test_secret';

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/events', eventsRouter);
    return app;
};

const createAdminToken = (userId = 1) => {
    return jwt.sign({ id: userId, role: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });
};

const createUserToken = (userId = 2) => {
    return jwt.sign({ id: userId, role: 'Registered User' }, JWT_SECRET, { expiresIn: '1h' });
};

describe('Events API', () => {
    let app;
    let adminToken;
    let userToken;

    beforeEach(() => {
        app = createApp();
        adminToken = createAdminToken();
        userToken = createUserToken();
        jest.clearAllMocks();
    });

    describe('GET /api/events', () => {
        it('should return all events', async () => {
            const mockEvents = [
                { id: 1, title: 'Event 1', event_date: '2025-12-01', location: 'Location 1', enable_rsvp: true },
                { id: 2, title: 'Event 2', event_date: '2025-12-02', location: 'Location 2', enable_rsvp: false }
            ];
            db.query.mockResolvedValue({ rows: mockEvents });

            const res = await request(app).get('/api/events');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockEvents);
            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT * FROM events'), expect.any(Array));
        });

        it('should filter featured events', async () => {
            const mockEvents = [{ id: 1, title: 'Featured Event', is_featured: true }];
            db.query.mockResolvedValue({ rows: mockEvents });

            const res = await request(app).get('/api/events?featured=true');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockEvents);
        });
    });

    describe('POST /api/events', () => {
        const validEventData = {
            title: 'New Event',
            slug: 'new-event',
            date: '2025-12-01',
            location: 'Test Location',
            description: 'Test description',
            category: 'Test',
            image_url: '',
            is_featured: false,
            enable_rsvp: true
        };

        it('should create event with admin token', async () => {
            const createdEvent = { id: 1, ...validEventData };
            db.query.mockResolvedValue({ rows: [createdEvent] });

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validEventData);

            expect(res.status).toBe(201);
            expect(res.body).toEqual(createdEvent);
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO events'),
                expect.arrayContaining([validEventData.title, validEventData.slug, validEventData.date, validEventData.location, validEventData.description, validEventData.category, validEventData.image_url, false, true])
            );
        });

        it('should reject without auth', async () => {
            const res = await request(app)
                .post('/api/events')
                .send(validEventData);

            expect(res.status).toBe(401);
        });

        it('should reject non-admin user', async () => {
            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validEventData);

            expect(res.status).toBe(403);
        });

        it('should handle duplicate slug error', async () => {
            const error = new Error('duplicate key');
            error.code = '23505';
            db.query.mockRejectedValue(error);

            const res = await request(app)
                .post('/api/events')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validEventData);

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Slug already exists');
        });
    });

    describe('PUT /api/events/:id', () => {
        const updateData = {
            title: 'Updated Event',
            slug: 'updated-event',
            date: '2025-12-02',
            location: 'Updated Location',
            description: 'Updated description',
            category: 'Updated',
            image_url: '',
            is_featured: true,
            enable_rsvp: false
        };

        it('should update event with admin token', async () => {
            const updatedEvent = { id: 1, ...updateData };
            db.query.mockResolvedValue({ rows: [updatedEvent] });

            const res = await request(app)
                .put('/api/events/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedEvent);
        });

        it('should return 404 for non-existent event', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .put('/api/events/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Event not found');
        });
    });

    describe('DELETE /api/events/:id', () => {
        it('should delete event with admin token', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1 }] });

            const res = await request(app)
                .delete('/api/events/1')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Event deleted');
        });

        it('should return 404 for non-existent event', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .delete('/api/events/999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Event not found');
        });
    });

    describe('POST /api/events/:id/rsvp', () => {
        it('should create RSVP for event with RSVP enabled', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1, enable_rsvp: true }] }) // event check
                .mockResolvedValueOnce({ rows: [{ id: 1, event_id: 1, name: 'John', phone_number: '+254700000000' }] }); // RSVP insert

            const res = await request(app)
                .post('/api/events/1/rsvp')
                .send({ name: 'John', phone_number: '+254700000000' });

            expect(res.status).toBe(201);
            expect(res.body.name).toBe('John');
        });

        it('should reject RSVP for event with RSVP disabled', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1, enable_rsvp: false }] });

            const res = await request(app)
                .post('/api/events/1/rsvp')
                .send({ name: 'John', phone_number: '+254700000000' });

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('RSVP is not enabled for this event');
        });

        it('should return 404 for non-existent event', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .post('/api/events/999/rsvp')
                .send({ name: 'John', phone_number: '+254700000000' });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Event not found');
        });

        it('should handle duplicate RSVP', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [{ id: 1, enable_rsvp: true }] })
                .mockRejectedValueOnce({ code: '23505' });

            const res = await request(app)
                .post('/api/events/1/rsvp')
                .send({ name: 'John', phone_number: '+254700000000' });

            expect(res.status).toBe(400);
            expect(res.body.error).toContain('already RSVP');
        });
    });

    describe('GET /api/events/:id/rsvps', () => {
        it('should return RSVPs for event with admin token', async () => {
            const mockRsvps = [
                { id: 1, event_id: 1, name: 'John', phone_number: '+254700000000', created_at: '2025-11-01' }
            ];
            db.query.mockResolvedValue({ rows: mockRsvps });

            const res = await request(app)
                .get('/api/events/1/rsvps')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockRsvps);
        });

        it('should reject without admin token', async () => {
            const res = await request(app)
                .get('/api/events/1/rsvps')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe('DELETE /api/events/rsvp/:id', () => {
        it('should delete RSVP with admin token', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1 }] });

            const res = await request(app)
                .delete('/api/events/rsvp/1')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('RSVP deleted');
        });

        it('should return 404 for non-existent RSVP', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .delete('/api/events/rsvp/999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('RSVP not found');
        });
    });
});