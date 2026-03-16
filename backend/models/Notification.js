const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    type: { 
        type: String, 
        enum: [
            'appointment_pending',
            'appointment_confirmed', 
            'appointment_cancelled',
            'appointment_reminder',
            'appointment_completed',
            'message_received',
            'review_received',
            'availability_updated',
            'system_announcement'
        ], 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    message: { 
        type: String, 
        required: true 
    },
    data: {
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        customData: mongoose.Schema.Types.Mixed
    },
    channels: {
        inApp: { type: Boolean, default: true },
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: false }
    },
    status: { 
        type: String, 
        enum: ['pending', 'sent', 'delivered', 'read', 'failed'], 
        default: 'pending' 
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    scheduledFor: {
        type: Date
    },
    readAt: {
        type: Date
    }
}, { 
    timestamps: true 
});

notificationSchema.index({ recipient: 1, status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ scheduledFor: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
