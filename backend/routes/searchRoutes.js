const express = require('express');
const {
    searchDoctors,
    getDoctorDetails,
    getSpecialties,
    getDoctorAvailableSlots
} = require('../controllers/searchController');

const router = express.Router();

router.get('/doctors', searchDoctors);
router.get('/doctors/:id', getDoctorDetails);
router.get('/specialties', getSpecialties);
router.get('/slots/:doctorId', getDoctorAvailableSlots);

module.exports = router;
