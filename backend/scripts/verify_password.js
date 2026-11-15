require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcryptjs');

async function verify() {
    const res = await db.query('SELECT password_hash FROM users WHERE email = $1', ['admin@yscstdominic.org']);
    if (res.rows.length > 0) {
        const match = await bcrypt.compare('12345678', res.rows[0].password_hash);
        console.log('Password verification:', match ? '✅ SUCCESS' : '❌ FAILED');
    }
    process.exit(0);
}
verify();