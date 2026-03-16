const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true 
    },
    description: { 
        type: String, 
        required: true 
    },
    icon: { 
        type: String, 
        default: '🏥' 
    },
    color: { 
        type: String, 
        default: '#10b981' 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    averageConsultationDuration: { 
        type: Number, 
        default: 30 // minutes
    },
    typicalPriceRange: {
        min: { type: Number },
        max: { type: Number }
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Specialty', specialtySchema);
