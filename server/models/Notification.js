const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String, // e.g. 'email', 'sms', 'whatsapp'
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String, // e.g. 'sent', 'failed', 'pending'
        required: true,
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', NotificationSchema);
