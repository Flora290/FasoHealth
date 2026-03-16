const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    appointment: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Appointment' 
    },
    content: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['text', 'image', 'document', 'voice', 'video'], 
        default: 'text' 
    },
    attachmentUrl: {
        type: String
    },
    attachmentName: {
        type: String
    },
    isRead: { 
        type: Boolean, 
        default: false 
    },
    readAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        deletedAt: { type: Date }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
        addedAt: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true 
});

messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ appointment: 1 });

module.exports = mongoose.model('Message', messageSchema);
