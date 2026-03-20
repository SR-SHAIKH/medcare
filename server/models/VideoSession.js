const mongoose = require('mongoose');

const VideoSessionSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.ObjectId,
        ref: 'Appointment',
        required: true
    },
    meetingLink: {
        type: String,
        required: true
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('VideoSession', VideoSessionSchema);
