const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../db', () => ({
    query: jest.fn()
}));

jest.mock('bcryptjs', () => ({
    genSalt: jest.fn().mockResolvedValue('$2a$10$'),
    hash: jest.fn().mockResolvedValue('$2a$10$hashedpassword'),
    compare: jest.fn().mockResolvedValue(true)
}));

const db = require('../db');
const authRouter = require('../routes/auth');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

const JWT_SECRET = 'test_secret';

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
    return app;
};

const createAdminToken = (userId = 1) => {
    return jwt.sign({ id: userId, role: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });
};

const createUserToken = (userId = 2) => {
    return jwt.sign({ id: userId, role: 'Registered User' }, JWT_SECRET, { expiresIn: '1h' });
};

describe('Auth API', () => {
    let app;
    let adminToken;
    let userToken;

    beforeEach(() => {
        app = createApp();
        adminToken = createAdminToken();
        userToken = createUserToken();
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register new user', async () => {
            const newUser = { id: 1, email: 'test@test.com', full_name: 'Test User', role: 'Registered User', created_at: new Date().toISOString() };
            db.query
                .mockResolvedValueOnce({ rows: [] }) // existing user check
                .mockResolvedValueOnce({ rows: [newUser] }); // insert

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@test.com', password: 'password123', fullName: 'Test User' });

            expect(res.status).toBe(201);
            expect(res.body.user).toEqual(newUser);
            expect(res.body.token).toBeDefined();
        });

        it('should reject duplicate email', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1 }] });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'existing@test.com', password: 'password123' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('User with this email already exists');
        });

        it('should reject missing email/password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email and password are required');
        });
    });

    describe('POST /api/auth/login', () => {
        const hashedPassword = '$2a$10$testhashedpassword';

        it('should login successfully', async () => {
            const user = { id: 1, email: 'test@test.com', password_hash: hashedPassword, full_name: 'Test User', role: 'Registered User', profile_image_url: null };
            db.query.mockResolvedValue({ rows: [user] });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'password123' });

            expect(res.status).toBe(200);
            expect(res.body.user).toEqual({ id: 1, email: 'test@test.com', full_name: 'Test User', role: 'Registered User', profile_image_url: null });
            expect(res.body.token).toBeDefined();
        });

        it('should reject invalid email', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@test.com', password: 'password123' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject invalid password', async () => {
            // Mock bcrypt.compare to return false for this test
            bcrypt.compare.mockResolvedValueOnce(false);
            
            const user = { id: 1, email: 'test@test.com', password_hash: '$2a$10$hashedpassword' };
            db.query.mockResolvedValue({ rows: [user] });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'wrongpassword' });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid credentials');
        });

        it('should reject user without password hash', async () => {
            const user = { id: 1, email: 'test@test.com', password_hash: null };
            db.query.mockResolvedValue({ rows: [user] });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com', password: 'password123' });

            expect(res.status).toBe(401);
            expect(res.body.message).toContain('no password set');
        });

        it('should reject missing email/password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@test.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email and password are required');
        });
    });

    describe('GET /api/auth/me', () => {
        it('should return current user', async () => {
            const user = { id: 1, email: 'test@test.com', full_name: 'Test User', role: 'Registered User', profile_image_url: null };
            db.query.mockResolvedValue({ rows: [user] });

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(user);
        });

        it('should reject without auth', async () => {
            const res = await request(app).get('/api/auth/me');
            expect(res.status).toBe(401);
        });

        it('should return 404 for non-existent user', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('User not found');
        });
    });

    describe('GET /api/auth/users', () => {
        it('should return all users for admin', async () => {
            const users = [
                { id: 1, email: 'admin@test.com', full_name: 'Admin', role: 'Admin', created_at: new Date().toISOString() },
                { id: 2, email: 'user@test.com', full_name: 'User', role: 'Registered User', created_at: new Date().toISOString() }
            ];
            db.query.mockResolvedValue({ rows: users });

            const res = await request(app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(users);
        });

        it('should reject non-admin user', async () => {
            const res = await request(app)
                .get('/api/auth/users')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe('PUT /api/auth/users/:id', () => {
        it('should update user for admin', async () => {
            const updatedUser = { id: 1, full_name: 'Updated Name', email: 'test@test.com', role: 'Admin' };
            db.query.mockResolvedValue({ rows: [updatedUser] });

            const res = await request(app)
                .put('/api/auth/users/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ full_name: 'Updated Name', role: 'Admin' });

            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedUser);
        });

        it('should return 404 for non-existent user', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .put('/api/auth/users/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ full_name: 'Updated Name', role: 'Admin' });

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('User not found');
        });
    });

    describe('DELETE /api/auth/users/:id', () => {
        it('should delete user for admin', async () => {
            // The route doesn't check if user exists, just runs DELETE
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .delete('/api/auth/users/1')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User deleted');
        });

        it('should handle non-existent user', async () => {
            // The route doesn't check if user exists
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .delete('/api/auth/users/999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('User deleted');
        });
    });
});