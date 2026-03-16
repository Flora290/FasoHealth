const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { sendEmailNotification } = require('../services/emailService');

// @desc    Create a review for a doctor
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
    try {
        const {
            appointment,
            rating,
            comment,
            aspects,
            wouldRecommend,
            treatmentOutcome,
            waitTime
        } = req.body;

        // Verify appointment exists and belongs to the user
        const appointmentDoc = await Appointment.findById(appointment)
            .populate('doctor')
            .populate('patient');

        if (!appointmentDoc) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user is the patient
        if (appointmentDoc.patient._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only review your own appointments' });
        }

        // Check if appointment is completed
        if (appointmentDoc.status !== 'completed') {
            return res.status(400).json({ message: 'You can only review completed appointments' });
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            patient: req.user._id,
            doctor: appointmentDoc.doctor._id,
            appointment
        });

        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this appointment' });
        }

        // Create review
        const review = await Review.create({
            patient: req.user._id,
            doctor: appointmentDoc.doctor._id,
            appointment,
            rating,
            comment,
            aspects,
            wouldRecommend,
            treatmentOutcome,
            waitTime
        });

        // Populate review details
        const populatedReview = await Review.findById(review._id)
            .populate('patient', 'name')
            .populate('doctor', 'name email')
            .populate('appointment', 'date reason');

        // Create notification for doctor
        await Notification.create({
            recipient: appointmentDoc.doctor._id,
            type: 'review_received',
            title: 'Nouvel avis reçu',
            message: `${req.user.name} a laissé un avis de ${rating}/5 étoiles`,
            data: {
                appointmentId: appointment,
                patientId: req.user._id,
                rating,
                comment
            },
            channels: {
                inApp: true,
                email: true
            }
        });

        // Send email notification to doctor
        if (appointmentDoc.doctor.email) {
            await sendEmailNotification(
                appointmentDoc.doctor._id,
                'review_received',
                {
                    patientName: req.user.name,
                    doctorName: appointmentDoc.doctor.name,
                    rating,
                    comment,
                    date: appointmentDoc.date.toLocaleDateString()
                }
            );
        }

        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a doctor
// @route   GET /api/reviews/doctor/:doctorId
// @access  Public
const getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = -1, showUnverified } = req.query;

        let query = { doctor: doctorId };
        
        // Default to only verified reviews unless specifically requested
        if (showUnverified === 'true') {
            // Check if requester is the doctor being viewed
            const isSelf = req.user && req.user._id.toString() === doctorId;
            const isAdmin = req.user && req.user.role === 'admin';
            
            if (!isSelf && !isAdmin) {
                query.isVerified = true;
            }
            // If isSelf or isAdmin, we don't filter by isVerified (show both)
        } else {
            query.isVerified = true;
        }
        
        if (rating) {
            query.rating = parseInt(rating);
        }

        const sort = {};
        sort[sortBy] = sortOrder === '1' ? 1 : -1;

        const reviews = await Review.find(query)
            .populate('patient', 'name')
            .populate('appointment', 'date reason')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments(query);

        // Calculate rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { doctor: doctorId, isVerified: true } },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': -1 } }
        ]);

        // Calculate average rating and aspect ratings
        const stats = await Review.aggregate([
            { $match: { doctor: doctorId, isVerified: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    averageProfessionalism: { $avg: '$aspects.professionalism' },
                    averageCommunication: { $avg: '$aspects.communication' },
                    averagePunctuality: { $avg: '$aspects.punctuality' },
                    averageCleanliness: { $avg: '$aspects.cleanliness' },
                    averageEffectiveness: { $avg: '$aspects.effectiveness' },
                    wouldRecommendCount: {
                        $sum: { $cond: ['$wouldRecommend', 1, 0] }
                    }
                }
            }
        ]);

        const ratingStats = stats[0] || {};
        const recommendationRate = ratingStats.totalReviews > 0 
            ? Math.round((ratingStats.wouldRecommendCount / ratingStats.totalReviews) * 100) 
            : 0;

        res.json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            stats: {
                averageRating: ratingStats.averageRating ? Math.round(ratingStats.averageRating * 10) / 10 : 0,
                totalReviews: ratingStats.totalReviews || 0,
                recommendationRate,
                aspectRatings: {
                    professionalism: ratingStats.averageProfessionalism ? Math.round(ratingStats.averageProfessionalism * 10) / 10 : 0,
                    communication: ratingStats.averageCommunication ? Math.round(ratingStats.averageCommunication * 10) / 10 : 0,
                    punctuality: ratingStats.averagePunctuality ? Math.round(ratingStats.averagePunctuality * 10) / 10 : 0,
                    cleanliness: ratingStats.averageCleanliness ? Math.round(ratingStats.averageCleanliness * 10) / 10 : 0,
                    effectiveness: ratingStats.averageEffectiveness ? Math.round(ratingStats.averageEffectiveness * 10) / 10 : 0
                }
            },
            ratingDistribution
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user's reviews (as patient)
// @route   GET /api/reviews/my
// @access  Private
const getMyReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const reviews = await Review.find({ patient: req.user._id })
            .populate('doctor', 'name specialty')
            .populate('appointment', 'date reason')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments({ patient: req.user._id });

        res.json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Private
const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id)
            .populate('patient', 'name')
            .populate('doctor', 'name specialty')
            .populate('appointment', 'date reason');

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check authorization
        if (
            review.patient._id.toString() !== req.user._id.toString() &&
            review.doctor._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to view this review' });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update review (patient can edit their own review)
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
    try {
        const { rating, comment, aspects, wouldRecommend, treatmentOutcome, waitTime } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.patient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only edit your own reviews' });
        }

        // Update review
        review.rating = rating || review.rating;
        review.comment = comment || review.comment;
        review.aspects = aspects || review.aspects;
        review.wouldRecommend = wouldRecommend !== undefined ? wouldRecommend : review.wouldRecommend;
        review.treatmentOutcome = treatmentOutcome || review.treatmentOutcome;
        review.waitTime = waitTime || review.waitTime;

        const updatedReview = await review.save();

        // Populate updated review
        const populatedReview = await Review.findById(updatedReview._id)
            .populate('patient', 'name')
            .populate('doctor', 'name')
            .populate('appointment', 'date reason');

        res.json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check authorization
        const isPatient = review.patient.toString() === req.user._id.toString();
        const isDoctor = review.doctor.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        if (!isPatient && !isDoctor && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await review.remove();

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Respond to review (doctor can respond to reviews about them)
// @route   POST /api/reviews/:id/respond
// @access  Private
const respondToReview = async (req, res) => {
    try {
        const { text } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user is the doctor being reviewed
        if (review.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You can only respond to reviews about you' });
        }

        // Add response
        review.response = {
            text,
            respondedAt: new Date(),
            respondedBy: req.user._id
        };

        const updatedReview = await review.save();

        // Populate updated review
        const populatedReview = await Review.findById(updatedReview._id)
            .populate('patient', 'name')
            .populate('doctor', 'name')
            .populate('response.respondedBy', 'name');

        // Create notification for patient
        await Notification.create({
            recipient: review.patient,
            type: 'message_received',
            title: 'Réponse à votre avis',
            message: `Dr ${req.user.name} a répondu à votre avis`,
            data: {
                reviewId: review._id,
                doctorId: req.user._id
            },
            channels: {
                inApp: true,
                email: true
            }
        });

        res.json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markReviewHelpful = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user already marked as helpful
        const alreadyHelpful = review.helpful.users.some(
            user => user.toString() === req.user._id.toString()
        );

        if (alreadyHelpful) {
            return res.status(400).json({ message: 'You already marked this review as helpful' });
        }

        // Add user to helpful users
        review.helpful.users.push(req.user._id);
        review.helpful.count += 1;

        const updatedReview = await review.save();

        res.json({
            helpful: updatedReview.helpful.count,
            message: 'Review marked as helpful'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for admin (all reviews)
// @route   GET /api/reviews/admin
// @access  Private (Admin only)
const getAdminReviews = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, rating, doctorId, patientId } = req.query;

        let query = {};
        
        if (status === 'verified') {
            query.isVerified = true;
        } else if (status === 'unverified') {
            query.isVerified = false;
        }
        
        if (rating) {
            query.rating = parseInt(rating);
        }
        
        if (doctorId) {
            query.doctor = doctorId;
        }
        
        if (patientId) {
            query.patient = patientId;
        }

        const reviews = await Review.find(query)
            .populate('patient', 'name email')
            .populate('doctor', 'name email')
            .populate('appointment', 'date reason')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Review.countDocuments(query);

        res.json({
            reviews,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify/unverify review (Admin only)
// @route   PUT /api/reviews/:id/verify
// @access  Private (Admin only)
const verifyReview = async (req, res) => {
    try {
        const { isVerified } = req.body;

        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        review.isVerified = isVerified;
        const updatedReview = await review.save();

        res.json(updatedReview);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReview,
    getDoctorReviews,
    getMyReviews,
    getReviewById,
    updateReview,
    deleteReview,
    respondToReview,
    markReviewHelpful,
    getAdminReviews,
    verifyReview
};
