const express = require('express');
const {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createNotification,
    getNotificationStats
} = require('../controllers/notificationController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protected routes
router.get('/', protect, getNotifications);
router.get('/stats', protect, getNotificationStats);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllNotificationsAsRead);
router.delete('/:id', protect, deleteNotification);

// Admin only
router.post('/', protect, admin, createNotification);

module.exports = router;
