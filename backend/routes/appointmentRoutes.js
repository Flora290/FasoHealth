const express = require('express');
const {
    createAppointment,
    getAppointments,
    getAppointmentById,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    updateAppointmentDetails
} = require('../controllers/appointmentController');
const { protect, doctor, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// ⚠️ IMPORTANT: Specific named routes MUST come before /:id to avoid Express
// treating 'my' and 'doctor' as ID parameters
router.post('/', protect, createAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/doctor', protect, doctor, getDoctorAppointments);
router.get('/', protect, getAppointments);
router.get('/:id', protect, getAppointmentById);
router.put('/:id', protect, doctor, updateAppointmentDetails);
router.put('/:id/status', protect, doctor, updateAppointmentStatus);

module.exports = router;
