const Hospital = require('../models/Hospital');

// @desc    Get all hospitals
// @route   GET /api/hospitals
// @access  Public
const getHospitals = async (req, res) => {
    try {
        const hospitals = await Hospital.find({ isActive: true }).populate('doctors', 'name specialty');
        res.json(hospitals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHospitals,
};
