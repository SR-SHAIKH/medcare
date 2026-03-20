require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const MedicalRecord = require('./models/MedicalRecord');

const verifyBackend = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const user = await User.findOne({ role: 'patient' });
        if (!user) {
            console.log('No patient found for testing');
            process.exit();
        }
        
        console.log(`Checking data for patient: ${user.name} (${user.email})`);
        
        // 1. Check Appointments
        const appointments = await Appointment.find({ user: user._id });
        console.log(`- Found ${appointments.length} appointments`);
        
        // 2. Check Medical Records
        const records = await MedicalRecord.find({ patient: user._id });
        console.log(`- Found ${records.length} medical records`);
        
        // 3. Check User fields
        console.log(`- Profile Image field exists: ${user.profileImage !== undefined}`);
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

verifyBackend();
