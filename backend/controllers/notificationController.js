const Notification = require('../models/Notification');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        const { 
            type, 
            status = 'pending', 
            page = 1, 
            limit = 20,
            unreadOnly 
        } = req.query;

        let query = { recipient: req.user._id };

        if (type) query.type = type;
        if (status) query.status = status;
        if (unreadOnly === 'true') query.readAt = { $exists: false };

        const notifications = await Notification.find(query)
            .populate('sender', 'name')
            .populate('data.appointmentId', 'date startTime status')
            .populate('data.doctorId', 'name')
            .populate('data.patientId', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            recipient: req.user._id,
            readAt: { $exists: false }
        });

        res.json({
            notifications,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check ownership
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this notification' });
        }

        notification.readAt = new Date();
        notification.status = 'read';
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { 
                recipient: req.user._id,
                readAt: { $exists: false }
            },
            { 
                readAt: new Date(),
                status: 'read'
            }
        );

        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check ownership
        if (notification.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this notification' });
        }

        await notification.remove();

        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create notification (internal use)
// @route   POST /api/notifications
// @access  Private (Admin/System)
const createNotification = async (req, res) => {
    try {
        const {
            recipient,
            sender,
            type,
            title,
            message,
            data,
            channels = { inApp: true },
            priority = 'medium',
            scheduledFor
        } = req.body;

        // Only admin can create notifications
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to create notifications' });
        }

        const notification = await Notification.create({
            recipient,
            sender: sender || req.user._id,
            type,
            title,
            message,
            data,
            channels,
            priority,
            scheduledFor
        });

        const populatedNotification = await Notification.findById(notification._id)
            .populate('recipient', 'name email')
            .populate('sender', 'name');

        res.status(201).json(populatedNotification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res) => {
    try {
        const stats = await Notification.aggregate([
            { $match: { recipient: req.user._id } },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 },
                    unread: {
                        $sum: {
                            $cond: [{ $eq: ['$readAt', null] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        const totalUnread = await Notification.countDocuments({
            recipient: req.user._id,
            readAt: { $exists: false }
        });

        res.json({
            stats,
            totalUnread
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    createNotification,
    getNotificationStats
};
