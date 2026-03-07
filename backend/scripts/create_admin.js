require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];
    const fullName = process.argv[4] || 'System Admin';

    if (!email || !password) {
        console.error('Usage: node create_admin.js <email> <password> [fullName]');
        process.exit(1);
    }

    try {
        // Check if user exists
        const checkResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (checkResult.rows.length > 0) {
            console.log(`User ${email} already exists. Promoting to Admin...`);
            await db.query("UPDATE users SET role = 'Admin' WHERE email = $1", [email]);
            console.log('User promoted successfully.');
        } else {
            console.log(`Creating new Admin user: ${email}...`);
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query(
                "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1, $2, $3, 'Admin')",
                [email, hashedPassword, fullName]
            );
            console.log('Admin user created successfully.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

createAdmin();
