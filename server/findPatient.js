require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const findPatient = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ role: 'patient' });
        if (user) {
            console.log('Patient Email:', user.email);
        } else {
            console.log('No patient found');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findPatient();
