const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../db', () => ({
    query: jest.fn()
}));

const db = require('../db');
const blogRouter = require('../routes/blog');
const { authMiddleware, adminRequired } = require('../middleware/customAuth');

const JWT_SECRET = 'test_secret';

const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use('/api/blog', blogRouter);
    return app;
};

const createAdminToken = (userId = 1) => {
    return jwt.sign({ id: userId, role: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });
};

const createUserToken = (userId = 2) => {
    return jwt.sign({ id: userId, role: 'Registered User' }, JWT_SECRET, { expiresIn: '1h' });
};

describe('Blog API', () => {
    let app;
    let adminToken;
    let userToken;

    beforeEach(() => {
        app = createApp();
        adminToken = createAdminToken();
        userToken = createUserToken();
        jest.clearAllMocks();
    });

    describe('GET /api/blog', () => {
        it('should return all blog posts', async () => {
            const mockPosts = [
                { id: 1, title: 'Post 1', slug: 'post-1', is_published: true, is_featured: false },
                { id: 2, title: 'Post 2', slug: 'post-2', is_published: true, is_featured: true }
            ];
            db.query.mockResolvedValue({ rows: mockPosts });

            const res = await request(app).get('/api/blog');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosts);
        });

        it('should filter featured posts', async () => {
            const mockPosts = [{ id: 1, title: 'Featured Post', is_featured: true }];
            db.query.mockResolvedValue({ rows: mockPosts });

            const res = await request(app).get('/api/blog?featured=true');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosts);
        });

        it('should filter by category', async () => {
            const mockPosts = [{ id: 1, title: 'Category Post', category: 'test' }];
            db.query.mockResolvedValue({ rows: mockPosts });

            const res = await request(app).get('/api/blog?category=test');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosts);
        });

        it('should limit results', async () => {
            const mockPosts = [{ id: 1, title: 'Post 1' }];
            db.query.mockResolvedValue({ rows: mockPosts });

            const res = await request(app).get('/api/blog?limit=1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosts);
        });
    });

    describe('GET /api/blog/:slug', () => {
        it('should return single blog post', async () => {
            const mockPost = { id: 1, title: 'Test Post', slug: 'test-post', content: {} };
            db.query.mockResolvedValue({ rows: [mockPost] });

            const res = await request(app).get('/api/blog/test-post');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPost);
        });

        it('should return 404 for non-existent post', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app).get('/api/blog/non-existent');

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Post not found');
        });
    });

    describe('POST /api/blog', () => {
        const validPostData = {
            title: 'New Post',
            slug: 'new-post',
            excerpt: 'Test excerpt',
            content: { type: 'doc', content: [] },
            category: 'Test',
            image_url: '',
            author: 'Test Author',
            is_featured: false
        };

        it('should create post with admin token', async () => {
            const createdPost = { id: 1, ...validPostData };
            db.query.mockResolvedValue({ rows: [createdPost] });

            const res = await request(app)
                .post('/api/blog')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validPostData);

            expect(res.status).toBe(201);
            expect(res.body).toEqual(createdPost);
        });

        it('should reject without auth', async () => {
            const res = await request(app)
                .post('/api/blog')
                .send(validPostData);

            expect(res.status).toBe(401);
        });

        it('should reject non-admin user', async () => {
            const res = await request(app)
                .post('/api/blog')
                .set('Authorization', `Bearer ${userToken}`)
                .send(validPostData);

            expect(res.status).toBe(403);
        });

        it('should handle duplicate slug error', async () => {
            const error = new Error('duplicate key');
            error.code = '23505';
            db.query.mockRejectedValue(error);

            const res = await request(app)
                .post('/api/blog')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(validPostData);

            expect(res.status).toBe(400);
            expect(res.body.error).toBe('Slug already exists');
        });
    });

    describe('PUT /api/blog/:id', () => {
        const updateData = {
            title: 'Updated Post',
            slug: 'updated-post',
            excerpt: 'Updated excerpt',
            content: { type: 'doc', content: [] },
            category: 'Updated',
            image_url: '',
            author: 'Updated Author',
            is_featured: true
        };

        it('should update post with admin token', async () => {
            const updatedPost = { id: 1, ...updateData };
            db.query.mockResolvedValue({ rows: [updatedPost] });

            const res = await request(app)
                .put('/api/blog/1')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedPost);
        });

        it('should return 404 for non-existent post', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .put('/api/blog/999')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Post not found');
        });
    });

    describe('DELETE /api/blog/:id', () => {
        it('should delete post with admin token', async () => {
            db.query.mockResolvedValue({ rows: [{ id: 1 }] });

            const res = await request(app)
                .delete('/api/blog/1')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Post deleted successfully');
        });

        it('should return 404 for non-existent post', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app)
                .delete('/api/blog/999')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Post not found');
        });
    });

    describe('POST /api/blog/view/:slug', () => {
        it('should increment view count', async () => {
            db.query.mockResolvedValue({ rows: [{ views: 5 }] });

            const res = await request(app).post('/api/blog/view/test-post');

            expect(res.status).toBe(200);
            expect(res.body.views).toBe(5);
        });

        it('should return 404 for non-existent post', async () => {
            db.query.mockResolvedValue({ rows: [] });

            const res = await request(app).post('/api/blog/view/non-existent');

            expect(res.status).toBe(404);
            expect(res.body.error).toBe('Post not found');
        });
    });
});