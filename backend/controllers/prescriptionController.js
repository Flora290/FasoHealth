const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment');

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res) => {
    try {
        const { appointmentId, medications, generalInstructions, diagnosis, notes, validUntil } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify doctor owns this appointment
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this appointment' });
        }

        const prescription = await Prescription.create({
            appointment: appointmentId,
            doctor: req.user._id,
            patient: appointment.patient,
            medications,
            generalInstructions,
            diagnosis,
            notes,
            validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days
        });

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single prescription
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id)
            .populate('doctor', 'name specialty phoneNumber email')
            .populate('patient', 'name phoneNumber')
            .populate('appointment', 'date reason');

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Check auth (patient or doctor)
        if (prescription.doctor._id.toString() !== req.user._id.toString() && 
            prescription.patient._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(prescription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user's prescriptions (as patient)
// @route   GET /api/prescriptions/my
// @access  Private
const getMyPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.user._id })
            .populate('doctor', 'name specialty phoneNumber email')
            .populate('patient', 'name phoneNumber')
            .populate('appointment', 'date reason')
            .sort({ createdAt: -1 });

        res.json({ prescriptions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a specific patient's prescriptions (for doctors)
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private/Doctor
const getPatientPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.params.patientId })
            .populate('doctor', 'name specialty')
            .populate('appointment', 'date')
            .sort({ createdAt: -1 });

        res.json({ prescriptions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPrescription,
    getPrescription,
    getMyPrescriptions,
    getPatientPrescriptions
};
