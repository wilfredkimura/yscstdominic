require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
    const email = 'admin@yscstdominic.org';
    const newPassword = '12345678';

    try {
        console.log(`Updating password for admin: ${email}...`);
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        const result = await db.query(
            `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING id, email, role`,
            [passwordHash, email]
        );

        if (result.rows.length > 0) {
            console.log('✅ Admin password updated successfully!');
            console.log('User:', result.rows[0]);
        } else {
            console.log('❌ Admin user not found');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
}

updateAdminPassword();