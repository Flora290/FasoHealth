const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { protect, admin } = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, `profile-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const docStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/kyc/');
    },
    filename: function (req, file, cb) {
        cb(null, `kyc-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadDocs = multer({
    storage: docStorage,
    limits: { fileSize: 10000000 }, // 10MB
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype || extname) {
            return cb(null, true);
        } else {
            cb(new Error('Images or PDFs Only!'));
        }
    }
});

const router = express.Router();

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin only)
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, search } = req.query;
        
        let query = {};
        
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .populate('specialty', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or own user)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('specialty', 'name');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this user' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin or own user)
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        const { name, email, phoneNumber, specialty, role } = req.body;

        // Only admin can change role
        if (role && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can change user role' });
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (specialty) user.specialty = specialty;
        if (role) user.role = role;

        const updatedUser = await user.save();

        // Remove password from response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;

        res.json(userResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deleting themselves
        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await user.remove();

        res.json({ message: 'User removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user password
// @route   PUT /api/users/:id/password
// @access  Private (own user only)
const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user is updating their own password
        if (req.user._id.toString() !== user._id.toString()) {
            return res.status(403).json({ message: 'You can only update your own password' });
        }

        // Verify current password
        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctors by specialty
// @route   GET /api/users/doctors/specialty/:specialtyId
// @access  Public
const getDoctorsBySpecialty = async (req, res) => {
    try {
        const { specialtyId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const doctors = await User.find({
            role: 'doctor',
            specialty: specialtyId,
            isActive: true
        })
        .select('-password')
        .populate('specialty', 'name')
        .sort({ name: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

        const total = await User.countDocuments({
            role: 'doctor',
            specialty: specialtyId,
            isActive: true
        });

        res.json({
            doctors,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user active status (Admin only)
// @route   PUT /api/users/:id/toggle-active
// @access  Private (Admin only)
const toggleUserActive = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent admin from deactivating themselves
        if (req.user._id.toString() === user._id.toString()) {
            return res.status(400).json({ message: 'You cannot deactivate your own account' });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: user.isActive
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload profile picture
// @route   POST /api/users/profile-picture
// @access  Private
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.profilePicture = `/uploads/${req.file.filename}`;
        await user.save();
        res.json({ message: 'Profile picture updated', profilePicture: user.profilePicture });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadKycDocuments = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        
        user.verificationDocuments.push(`/uploads/kyc/${req.file.filename}`);
        user.kycStatus = 'pending'; // Reset status to pending if they upload new docs
        await user.save();
        
        res.json({ 
            message: 'Document uploaded successfully', 
            documents: user.verificationDocuments,
            kycStatus: user.kycStatus
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
router.post('/profile-picture', protect, upload.single('image'), uploadProfilePicture);
router.post('/kyc-documents', protect, uploadDocs.single('document'), uploadKycDocuments);
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, getUserById);
router.put('/:id', protect, updateUser);
router.delete('/:id', protect, admin, deleteUser);
router.put('/:id/password', protect, updatePassword);
router.get('/doctors/specialty/:specialtyId', getDoctorsBySpecialty);
router.put('/:id/toggle-active', protect, admin, toggleUserActive);

module.exports = router;
