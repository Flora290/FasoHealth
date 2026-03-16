const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    specialty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Specialty',
        required: true
    },
    availability: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Availability'
    },
    date: { 
        type: Date, 
        required: true 
    },
    startTime: { 
        type: String, 
        required: true 
    },
    endTime: { 
        type: String, 
        required: true 
    },
    timeSlot: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'], 
        default: 'pending' 
    },
    consultationType: {
        type: String,
        enum: ['in-person', 'video'],
        default: 'in-person'
    },
    reason: { 
        type: String, 
        required: true 
    },
    notes: {
        type: String
    },
    diagnosis: {
        type: String
    },
    symptoms: {
        type: String
    },
    urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'emergency'],
        default: 'medium'
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'paid', 'refunded'],
            default: 'pending'
        },
        amount: Number,
        method: {
            type: String,
            enum: ['cash', 'card', 'insurance', 'online'],
            default: 'cash'
        }
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    videoLink: {
        type: String
    },
    cancellationReason: {
        type: String
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rescheduledTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    }
}, { 
    timestamps: true 
});

appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ specialty: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
