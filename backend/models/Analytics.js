const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['appointment_stats', 'user_stats', 'revenue_stats', 'specialty_stats'],
        required: true
    },
    period: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    data: {
        totalAppointments: { type: Number, default: 0 },
        confirmedAppointments: { type: Number, default: 0 },
        cancelledAppointments: { type: Number, default: 0 },
        completedAppointments: { type: Number, default: 0 },
        noShows: { type: Number, default: 0 },
        newUsers: { type: Number, default: 0 },
        activeDoctors: { type: Number, default: 0 },
        activePatients: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0 },
        specialtyBreakdown: [{
            specialty: { type: mongoose.Schema.Types.ObjectId, ref: 'Specialty' },
            count: Number,
            percentage: Number
        }],
        doctorPerformance: [{
            doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            totalAppointments: Number,
            completionRate: Number,
            averageRating: Number,
            revenue: Number
        }]
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { 
    timestamps: true 
});

analyticsSchema.index({ type: 1, period: 1, date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
