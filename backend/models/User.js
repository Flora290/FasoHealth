const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['patient', 'doctor', 'admin'], 
        default: 'patient' 
    },
    specialty: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Specialty'
    },
    phoneNumber: { type: String },
    profilePicture: { type: String, default: '' },
    isActive: { type: Boolean, default: function() {
        return this.role !== 'doctor'; // Doctors must be approved by admin
    }},
    isVerified: { type: Boolean, default: function() {
        return this.role === 'admin'; // Admins are verified by default
    }},
    otpCode: { type: String },
    otpExpires: { type: Date },
    verificationDocuments: [{ type: String }], // URLs or paths to documents
    kycStatus: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    }
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
