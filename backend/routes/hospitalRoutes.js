const express = require('express');
const { getHospitals } = require('../controllers/hospitalController');

const router = express.Router();

// @route   GET /api/hospitals
// @desc    Get all active hospitals
// @access  Public
router.get('/', getHospitals);

module.exports = router;
