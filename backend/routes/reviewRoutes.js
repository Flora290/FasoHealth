const express = require('express');
const {
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
} = require('../controllers/reviewController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/doctor/:doctorId', getDoctorReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/my', protect, getMyReviews);
router.get('/:id', protect, getReviewById);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/respond', protect, respondToReview);
router.post('/:id/helpful', protect, markReviewHelpful);

// Admin routes
router.get('/admin/all', protect, admin, getAdminReviews);
router.put('/:id/verify', protect, admin, verifyReview);

module.exports = router;
