const express = require('express');
const router = express.Router();
const {
    createPrescription,
    getPrescription,
    getMyPrescriptions,
    getPatientPrescriptions
} = require('../controllers/prescriptionController');
const { protect, doctor } = require('../middlewares/authMiddleware');

router.post('/', protect, doctor, createPrescription);
router.get('/my', protect, getMyPrescriptions);
router.get('/patient/:patientId', protect, doctor, getPatientPrescriptions);
router.get('/:id', protect, getPrescription);

module.exports = router;
