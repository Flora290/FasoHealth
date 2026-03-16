const express = require('express');
const {
    createAvailability,
    getDoctorAvailabilities,
    getAvailableSlots,
    updateAvailability,
    deleteAvailability
} = require('../controllers/availabilityController');
const { protect, doctor } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/doctor/:doctorId', getDoctorAvailabilities);
router.get('/slots/:doctorId/:date', getAvailableSlots);

// Protected routes
router.post('/', protect, doctor, createAvailability);
router.put('/:id', protect, doctor, updateAvailability);
router.delete('/:id', protect, doctor, deleteAvailability);

module.exports = router;
