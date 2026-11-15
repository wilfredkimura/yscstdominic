require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function addSlugColumn() {
    try {
        console.log('Adding slug column to events table...');
        await pool.query('ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;');
        console.log('✅ Slug column added successfully!');
        
        // Verify
        const result = await pool.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'events'
            ORDER BY ordinal_position
        `);
        console.log('\nUpdated Events table columns:');
        result.rows.forEach(row => {
            console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? 'NOT NULL' : ''} ${row.column_default ? 'DEFAULT ' + row.column_default : ''}`);
        });
        
        await pool.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        await pool.end();
        process.exit(1);
    }
}
addSlugColumn();