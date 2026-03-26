const User = require('../models/User');
const bcrypt = require('bcrypt');

/**
 * Ensures an admin user exists in the database.
 * Called automatically on server startup after DB connects.
 * Uses ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_PHONE from environment variables.
 */
const ensureAdminExists = async () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminPhone = process.env.ADMIN_PHONE || '0000000000';

    if (!adminEmail || !adminPassword) {
        console.log('[SEED] ⚠️ ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin creation');
        return;
    }

    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`[SEED] ✅ Admin already exists: ${adminEmail} (role: ${existingAdmin.role})`);
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Create admin user
        await User.create({
            name: 'Admin',
            email: adminEmail,
            password: hashedPassword,
            phone: adminPhone,
            role: 'admin'
        });

        console.log(`[SEED] ✅ Admin user created successfully: ${adminEmail}`);
    } catch (err) {
        console.error('[SEED] ❌ Failed to create admin user:', err.message);
        // Don't throw — admin seed failure shouldn't crash the server
    }
};

module.exports = ensureAdminExists;
