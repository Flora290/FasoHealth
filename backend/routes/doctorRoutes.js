const express = require('express');
const {
    getDoctorStats,
    getAvailabilityOverview,
    getDoctorPerformance
} = require('../controllers/doctorController');
const { protect, doctor } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require doctor authentication
router.use(protect);
router.use(doctor);

router.get('/stats', getDoctorStats);
router.get('/availability-overview', getAvailabilityOverview);
router.get('/performance', getDoctorPerformance);

module.exports = router;
