const Hospital = require('../models/Hospital');

// @desc    Get emergency numbers and hospitals
// @route   GET /api/emergency
// @access  Public
const getEmergencyInfo = async (req, res) => {
    try {
        const emergencyNumbers = [
            { name: 'Firefighters', number: '18', description: 'Fire and rescue emergencies' },
            { name: 'SAMU', number: '15', description: 'Medical emergencies' },
            { name: 'Police Help', number: '17', description: 'Security and police emergency' },
            { name: 'National Gendarmerie', number: '16', description: 'National security services' },
            { name: 'SOS Doctors', number: '+226 25 33 00 00', description: 'Private medical assistance' },
        ];

        // Fetch active hospitals for contact info
        const hospitals = await Hospital.find({}).select('name phoneNumber address city');

        res.json({
            emergencyNumbers,
            hospitals: hospitals.map(h => ({
                name: h.name,
                number: h.phoneNumber,
                address: h.address,
                city: h.city
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEmergencyInfo
};
