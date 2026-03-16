const express = require('express');
const {
    getDashboardStats,
    getAnalytics,
    exportData,
    getSystemHealth,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    getHospitals,
    createHospital,
    updateHospital,
    deleteHospital,
    getPendingDoctors,
    updateKycStatus,
    getMobileStatistics
} = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(admin);

// Dashboard & Analytics
router.get('/dashboard', getDashboardStats);
router.get('/mobile-statistics', getMobileStatistics);
router.get('/analytics', getAnalytics);
router.get('/export/:type', exportData);
router.get('/system-health', getSystemHealth);

// User Management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Specialty Management
router.post('/specialties', createSpecialty);
router.put('/specialties/:id', updateSpecialty);
router.delete('/specialties/:id', deleteSpecialty);

// Hospital Management
router.get('/hospitals', getHospitals);
router.post('/hospitals', createHospital);
router.put('/hospitals/:id', protect, admin, updateHospital);
router.delete('/hospitals/:id', protect, admin, deleteHospital);

// KYC Management
router.get('/kyc/pending', protect, admin, getPendingDoctors);
router.put('/kyc/:id/status', protect, admin, updateKycStatus);

module.exports = router;
