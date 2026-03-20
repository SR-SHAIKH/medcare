const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    specializations: [{
        type: String,
        required: true
    }],
    consultationTypes: [{
        type: String,
        enum: ['Online Consultation', 'Physical Clinic Visit'],
        required: true
    }],
    qualification: {
        type: String,
        required: true
    },
    experience: {
        type: Number, // Years of experience
        required: true
    },
    clinicLocation: {
        type: String,
        required: true
    },
    consultationFee: {
        type: Number,
        required: true
    },
    documents: [{
        type: String
    }],
    bio: {
        type: String,
        default: ''
    },
    profileImage: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    rating: {
        type: Number,
        default: 0
    },
    availability: [
        {
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            startTime: String, // '09:00'
            endTime: String    // '17:00'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
