const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const Review = require('../models/Review');
const User = require('../models/User');
const Analytics = require('../models/Analytics');

// @desc    Get doctor statistics
// @route   GET /api/doctor/stats
// @access  Private (Doctor only)
const getDoctorStats = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { period = 'month' } = req.query;

        // Calculate date range
        let startDate, groupFormat;
        const now = new Date();
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                groupFormat = { $dateToString: { format: '%Y-%m', date: '$date' } };
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$date' } };
        }

        // Appointment statistics
        const appointmentStats = await Appointment.aggregate([
            {
                $match: {
                    doctor: doctorId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: groupFormat,
                    total: { $sum: 1 },
                    confirmed: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    noShows: {
                        $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Overall stats
        const overallStats = await Appointment.aggregate([
            {
                $match: {
                    doctor: doctorId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    confirmedAppointments: {
                        $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
                    },
                    completedAppointments: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    cancelledAppointments: {
                        $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
                    },
                    noShows: {
                        $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] }
                    }
                }
            }
        ]);

        // Rating statistics
        const ratingStats = await Review.aggregate([
            {
                $match: {
                    doctor: doctorId,
                    isVerified: true
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    averageProfessionalism: { $avg: '$aspects.professionalism' },
                    averageCommunication: { $avg: '$aspects.communication' },
                    averagePunctuality: { $avg: '$aspects.punctuality' },
                    averageCleanliness: { $avg: '$aspects.cleanliness' },
                    averageEffectiveness: { $avg: '$aspects.effectiveness' }
                }
            }
        ]);

        // Availability statistics
        const availabilityStats = await Availability.aggregate([
            {
                $match: {
                    doctor: doctorId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSlots: { $sum: '$maxAppointments' },
                    activeDays: { $addToSet: '$date' }
                }
            },
            {
                $project: {
                    totalSlots: 1,
                    activeDays: { $size: '$activeDays' }
                }
            }
        ]);

        // Upcoming appointments
        const upcomingAppointments = await Appointment.find({
            doctor: doctorId,
            date: { $gte: now },
            status: { $in: ['pending', 'confirmed'] }
        })
        .populate('patient', 'name email phoneNumber')
        .sort({ date: 1, startTime: 1 })
        .limit(5);

        // Recent reviews
        const recentReviews = await Review.find({
            doctor: doctorId,
            isVerified: true
        })
        .populate('patient', 'name')
        .sort({ createdAt: -1 })
        .limit(5);

        // Patient count (Total distinct patients)
        const patientCount = await Appointment.distinct('patient', { doctor: doctorId });

        // Calculate completion rate
        const stats = overallStats[0] || {};
        const completionRate = stats.totalAppointments > 0 
            ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) 
            : 0;

        const ratings = ratingStats[0] || {};
        const availabilities = availabilityStats[0] || {};

        res.json({
            appointmentStats,
            overall: {
                ...stats,
                totalPatients: patientCount.length,
                completionRate,
                averageRating: ratings.averageRating ? Math.round(ratings.averageRating * 10) / 10 : 0,
                totalReviews: ratings.totalReviews || 0,
                totalSlots: availabilities.totalSlots || 0,
                activeDays: availabilities.activeDays || 0
            },
            ratingBreakdown: {
                professionalism: ratings.averageProfessionalism ? Math.round(ratings.averageProfessionalism * 10) / 10 : 0,
                communication: ratings.averageCommunication ? Math.round(ratings.averageCommunication * 10) / 10 : 0,
                punctuality: ratings.averagePunctuality ? Math.round(ratings.averagePunctuality * 10) / 10 : 0,
                cleanliness: ratings.averageCleanliness ? Math.round(ratings.averageCleanliness * 10) / 10 : 0,
                effectiveness: ratings.averageEffectiveness ? Math.round(ratings.averageEffectiveness * 10) / 10 : 0
            },
            upcomingAppointments,
            recentReviews
        });
    } catch (error) {
        console.error('Error in getDoctorStats:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor's availability overview
// @route   GET /api/doctor/availability-overview
// @access  Private (Doctor only)
const getAvailabilityOverview = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date();
        start.setHours(0, 0, 0, 0); // Start from beginning of day
        
        const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
        end.setHours(23, 59, 59, 999); // End at end of day

        const availabilities = await Availability.find({
            doctor: doctorId,
            date: { $gte: start, $lte: end },
            isActive: true
        })
        .sort({ date: 1, startTime: 1 });

        // Group by date
        const groupedAvailabilities = {};
        availabilities.forEach(availability => {
            const dateKey = availability.date.toISOString().split('T')[0];
            if (!groupedAvailabilities[dateKey]) {
                groupedAvailabilities[dateKey] = [];
            }
            groupedAvailabilities[dateKey].push(availability);
        });

        // Get appointments for each availability
        const availabilityWithBookings = await Promise.all(
            availabilities.map(async (availability) => {
                const appointments = await Appointment.find({
                    availability: availability._id,
                    status: { $in: ['pending', 'confirmed'] }
                });

                return {
                    ...availability.toObject(),
                    bookedSlots: appointments.length,
                    availableSlots: availability.maxAppointments - appointments.length,
                    isFullyBooked: appointments.length >= availability.maxAppointments
                };
            })
        );

        res.json({
            availabilities: availabilityWithBookings,
            groupedAvailabilities
        });
    } catch (error) {
        console.error('Error in getAvailabilityOverview:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor performance metrics
// @route   GET /api/doctor/performance
// @access  Private (Doctor only)
const getDoctorPerformance = async (req, res) => {
    try {
        const doctorId = req.user._id;
        const { period = 'month' } = req.query;

        // Calculate date range
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        // Patient retention rate
        const patientRetention = await Appointment.aggregate([
            {
                $match: {
                    doctor: doctorId,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$patient',
                    appointmentCount: { $sum: 1 },
                    firstAppointment: { $min: '$date' },
                    lastAppointment: { $max: '$date' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalPatients: { $sum: 1 },
                    returningPatients: {
                        $sum: { $cond: [{ $gt: ['$appointmentCount', 1] }, 1, 0] }
                    }
                }
            }
        ]);

        // Cancellation analysis
        const cancellationAnalysis = await Appointment.aggregate([
            {
                $match: {
                    doctor: doctorId,
                    date: { $gte: startDate },
                    status: 'cancelled'
                }
            },
            {
                $group: {
                    _id: null,
                    totalCancelled: { $sum: 1 },
                    cancelledByPatient: {
                        $sum: {
                            $cond: [
                                { $eq: ['$cancelledBy', '$patient'] },
                                1,
                                0
                            ]
                        }
                    },
                    cancelledByDoctor: {
                        $sum: {
                            $cond: [
                                { $eq: ['$cancelledBy', doctorId] },
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Revenue estimation (if payment data is available)
        const revenueStats = await Appointment.aggregate([
            {
                $match: {
                    doctor: doctorId,
                    date: { $gte: startDate },
                    status: 'completed',
                    'payment.status': 'paid'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$payment.amount' },
                    averageRevenue: { $avg: '$payment.amount' },
                    paidAppointments: { $sum: 1 }
                }
            }
        ]);

        const retention = patientRetention[0] || {};
        const cancellations = cancellationAnalysis[0] || {};
        const revenue = revenueStats[0] || {};

        const retentionRate = retention.totalPatients > 0 
            ? Math.round((retention.returningPatients / retention.totalPatients) * 100) 
            : 0;

        res.json({
            patientRetention: {
                totalPatients: retention.totalPatients || 0,
                returningPatients: retention.returningPatients || 0,
                retentionRate
            },
            cancellationAnalysis: {
                totalCancelled: cancellations.totalCancelled || 0,
                cancelledByPatient: cancellations.cancelledByPatient || 0,
                cancelledByDoctor: cancellations.cancelledByDoctor || 0
            },
            revenueStats: {
                totalRevenue: revenue.totalRevenue || 0,
                averageRevenue: revenue.averageRevenue || 0,
                paidAppointments: revenue.paidAppointments || 0
            }
        });
    } catch (error) {
        console.error('Error in getDoctorPerformance:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDoctorStats,
    getAvailabilityOverview,
    getDoctorPerformance
};
