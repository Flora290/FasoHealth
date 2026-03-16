const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
    doctor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
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
    slotDuration: { 
        type: Number, 
        default: 30 // minutes
    },
    isRecurring: { 
        type: Boolean, 
        default: false 
    },
    recurringPattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        default: null
    },
    recurringEndDate: {
        type: Date,
        default: null
    },
    maxAppointments: {
        type: Number,
        default: 1
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    location: {
        address: String,
        city: String,
        postalCode: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    consultationType: {
        type: String,
        enum: ['in-person', 'video', 'both'],
        default: 'in-person'
    }
}, { 
    timestamps: true 
});

availabilitySchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
