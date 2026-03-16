const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    provider: {
        type: String,
        enum: ['orange', 'moov', 'cash'],
        required: true
    },
    phoneNumber: {
        type: String
    },
    transactionId: {
        type: String,
        unique: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
