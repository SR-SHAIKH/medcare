const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true
    },
    time: {
        type: String, // format HH:mm
        required: true
    },
    isBooked: {
        type: Boolean,
        default: false
    },
    appointmentType: {
        type: String,
        enum: ['Online Consultation', 'Physical Clinic Visit', 'Both'],
        default: 'Both'
    }
});

module.exports = mongoose.model('Slot', SlotSchema);
