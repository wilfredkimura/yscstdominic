require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        console.log('Adding enable_rsvp column to events table...');
        await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS enable_rsvp BOOLEAN DEFAULT false NOT NULL;');
        console.log('✅ Column added successfully!');
        
        // Verify
        const result = await pool.query('SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = \'events\' AND column_name = \'enable_rsvp\';');
        console.log('Column info:', result.rows);
        
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        await pool.end();
        process.exit(1);
    }
}

runMigration();