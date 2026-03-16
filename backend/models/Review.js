const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    appointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Appointment', 
        required: true 
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    comment: { 
        type: String, 
        required: true 
    },
    aspects: {
        professionalism: { type: Number, min: 1, max: 5 },
        communication: { type: Number, min: 1, max: 5 },
        punctuality: { type: Number, min: 1, max: 5 },
        cleanliness: { type: Number, min: 1, max: 5 },
        effectiveness: { type: Number, min: 1, max: 5 }
    },
    wouldRecommend: {
        type: Boolean,
        required: true
    },
    treatmentOutcome: {
        type: String,
        enum: ['excellent', 'good', 'average', 'poor']
    },
    waitTime: {
        type: String,
        enum: ['less_than_15', '15_to_30', '30_to_45', 'more_than_45']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    response: {
        text: String,
        respondedAt: Date,
        respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    helpful: {
        count: { type: Number, default: 0 },
        users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
}, { 
    timestamps: true 
});

reviewSchema.index({ doctor: 1, rating: -1 });
reviewSchema.index({ patient: 1, doctor: 1 }, { unique: true });
reviewSchema.index({ isVerified: 1 });

module.exports = mongoose.model('Review', reviewSchema);
