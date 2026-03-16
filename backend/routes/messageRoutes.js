const express = require('express');
const Message = require('../models/Message');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// @desc    Get messages between current user and a recipient
// @route   GET /api/messages
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { recipientId, limit = 50, page = 1 } = req.query;

        let query = {
            isDeleted: false,
            $or: [
                { sender: req.user._id, recipient: recipientId },
                { sender: recipientId, recipient: req.user._id }
            ]
        };

        if (!recipientId) {
            // Return all conversations (last message per contact)
            const messages = await Message.find({
                $or: [{ sender: req.user._id }, { recipient: req.user._id }],
                isDeleted: false
            })
            .populate('sender', 'name role')
            .populate('recipient', 'name role')
            .sort({ createdAt: -1 })
            .limit(100);

            // Group by conversation partner
            const conversations = {};
            messages.forEach(msg => {
                const partner = msg.sender._id.toString() === req.user._id.toString()
                    ? msg.recipient
                    : msg.sender;
                const key = partner._id.toString();
                if (!conversations[key]) {
                    conversations[key] = { partner, lastMessage: msg };
                }
            });

            return res.json({ conversations: Object.values(conversations) });
        }

        const messages = await Message.find(query)
            .populate('sender', 'name role')
            .populate('recipient', 'name role')
            .sort({ createdAt: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Mark received messages as read
        await Message.updateMany(
            { recipient: req.user._id, sender: recipientId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        const total = await Message.countDocuments(query);

        res.json({ messages, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { recipient, content, appointment, type = 'text', attachmentUrl, attachmentName } = req.body;

        if (!recipient || !content) {
            return res.status(400).json({ message: 'Recipient and content are required' });
        }

        const message = await Message.create({
            sender: req.user._id,
            recipient,
            content,
            appointment,
            type,
            attachmentUrl,
            attachmentName
        });

        const populated = await Message.findById(message._id)
            .populate('sender', 'name role')
            .populate('recipient', 'name role');

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const message = await Message.findById(req.params.id);

        if (!message) return res.status(404).json({ message: 'Message not found' });
        if (message.sender.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        message.isDeleted = true;
        message.deletedBy.push({ user: req.user._id, deletedAt: new Date() });
        await message.save();

        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
