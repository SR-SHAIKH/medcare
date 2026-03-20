const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Doctor',
        required: true
    },
    appointmentType: {
        type: String,
        enum: ['Online Consultation', 'Physical Clinic Visit'],
        required: true
    },
    slot: {
        type: mongoose.Schema.ObjectId,
        ref: 'Slot',
        required: true
    },
    payment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Payment'
    },
    meetingLink: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
