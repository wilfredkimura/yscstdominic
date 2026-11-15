require('dotenv').config({ path: '.env.test' });

// Set test JWT_SECRET to match test tokens
process.env.JWT_SECRET = 'test_secret';

const { Pool } = require('pg');

const testPool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aLH1uyS7ZpRA@ep-sweet-recipe-anpwwm2h-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: { rejectUnauthorized: false }
});

beforeAll(async () => {
    await testPool.query('BEGIN');
});

afterAll(async () => {
    await testPool.query('ROLLBACK');
    await testPool.end();
});

global.testDb = testPool;