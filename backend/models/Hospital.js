const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a hospital name'],
        trim: true,
        unique: true
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    city: {
        type: String,
        required: [true, 'Please add a city']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Please add a contact phone number']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Hospital', hospitalSchema);
