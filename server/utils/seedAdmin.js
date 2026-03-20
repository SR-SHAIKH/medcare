const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {

    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({
        email: process.env.ADMIN_EMAIL
    });

    if (existingAdmin) {
        console.log('Admin already exists');
        process.exit();
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        salt
    );

    await User.create({
        name: 'System Admin',
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        phone: process.env.ADMIN_PHONE || null,
        role: 'admin'
    });

    console.log('Admin created');

    process.exit();
};

seedAdmin();