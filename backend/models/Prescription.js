const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    instructions: {
        type: String
    }
});

const prescriptionSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medications: [medicationSchema],
    diagnosis: {
        type: String
    },
    notes: {
        type: String
    },
    generalInstructions: {
        type: String
    },
    validUntil: {
        type: Date
    },
    sharedWith: [{
        type: { type: String, enum: ['pharmacy', 'patient'] },
        name: String,
        sharedAt: { type: Date, default: Date.now }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Prescription', prescriptionSchema);
