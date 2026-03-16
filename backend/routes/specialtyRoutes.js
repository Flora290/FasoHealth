const express = require('express');
const Specialty = require('../models/Specialty');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

// @desc    Get all specialties
// @route   GET /api/specialties
// @access  Public
const getSpecialties = async (req, res) => {
    try {
        const { page = 1, limit = 20, activeOnly } = req.query;
        
        let query = {};
        if (activeOnly === 'true') {
            query.isActive = true;
        }

        const specialties = await Specialty.find(query)
            .sort({ name: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Specialty.countDocuments(query);

        // Get doctor count for each specialty
        const specialtiesWithCount = await Promise.all(
            specialties.map(async (specialty) => {
                const User = require('../models/User');
                const doctorCount = await User.countDocuments({
                    specialty: specialty._id,
                    role: 'doctor',
                    isActive: true
                });

                return {
                    ...specialty.toObject(),
                    doctorCount
                };
            })
        );

        res.json({
            specialties: specialtiesWithCount,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single specialty
// @route   GET /api/specialties/:id
// @access  Public
const getSpecialtyById = async (req, res) => {
    try {
        const specialty = await Specialty.findById(req.params.id);

        if (!specialty) {
            return res.status(404).json({ message: 'Specialty not found' });
        }

        // Get doctor count
        const User = require('../models/User');
        const doctorCount = await User.countDocuments({
            specialty: specialty._id,
            role: 'doctor',
            isActive: true
        });

        res.json({
            ...specialty.toObject(),
            doctorCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create specialty (Admin only)
// @route   POST /api/specialties
// @access  Private (Admin only)
const createSpecialty = async (req, res) => {
    try {
        const { name, description, icon, color, averageConsultationDuration, typicalPriceRange } = req.body;

        // Check if specialty already exists
        const existingSpecialty = await Specialty.findOne({ name });
        if (existingSpecialty) {
            return res.status(400).json({ message: 'Specialty already exists' });
        }

        const specialty = await Specialty.create({
            name,
            description,
            icon: icon || '🏥',
            color: color || '#10b981',
            averageConsultationDuration: averageConsultationDuration || 30,
            typicalPriceRange: typicalPriceRange || {}
        });

        res.status(201).json(specialty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update specialty (Admin only)
// @route   PUT /api/specialties/:id
// @access  Private (Admin only)
const updateSpecialty = async (req, res) => {
    try {
        const specialty = await Specialty.findById(req.params.id);

        if (!specialty) {
            return res.status(404).json({ message: 'Specialty not found' });
        }

        const { name, description, icon, color, averageConsultationDuration, typicalPriceRange, isActive } = req.body;

        // Update fields
        if (name) specialty.name = name;
        if (description) specialty.description = description;
        if (icon) specialty.icon = icon;
        if (color) specialty.color = color;
        if (averageConsultationDuration) specialty.averageConsultationDuration = averageConsultationDuration;
        if (typicalPriceRange) specialty.typicalPriceRange = typicalPriceRange;
        if (isActive !== undefined) specialty.isActive = isActive;

        const updatedSpecialty = await specialty.save();

        res.json(updatedSpecialty);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete specialty (Admin only)
// @route   DELETE /api/specialties/:id
// @access  Private (Admin only)
const deleteSpecialty = async (req, res) => {
    try {
        const specialty = await Specialty.findById(req.params.id);

        if (!specialty) {
            return res.status(404).json({ message: 'Specialty not found' });
        }

        // Check if there are doctors with this specialty
        const User = require('../models/User');
        const doctorsCount = await User.countDocuments({ specialty: specialty._id });

        if (doctorsCount > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete specialty. There are doctors associated with this specialty.' 
            });
        }

        await specialty.remove();

        res.json({ message: 'Specialty removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle specialty active status (Admin only)
// @route   PUT /api/specialties/:id/toggle-active
// @access  Private (Admin only)
const toggleSpecialtyActive = async (req, res) => {
    try {
        const specialty = await Specialty.findById(req.params.id);

        if (!specialty) {
            return res.status(404).json({ message: 'Specialty not found' });
        }

        specialty.isActive = !specialty.isActive;
        await specialty.save();

        res.json({
            message: `Specialty ${specialty.isActive ? 'activated' : 'deactivated'} successfully`,
            isActive: specialty.isActive
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specialty statistics (Admin only)
// @route   GET /api/specialties/:id/stats
// @access  Private (Admin only)
const getSpecialtyStats = async (req, res) => {
    try {
        const specialty = await Specialty.findById(req.params.id);

        if (!specialty) {
            return res.status(404).json({ message: 'Specialty not found' });
        }

        // Get doctors count
        const User = require('../models/User');
        const doctorsCount = await User.countDocuments({
            specialty: specialty._id,
            role: 'doctor',
            isActive: true
        });

        // Get appointments count
        const Appointment = require('../models/Appointment');
        const appointmentsCount = await Appointment.countDocuments({
            specialty: specialty._id,
            date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) }
        });

        // Get reviews count and average rating
        const Review = require('../models/Review');
        const reviewStats = await Review.aggregate([
            {
                $lookup: {
                    from: 'appointments',
                    localField: 'appointment',
                    foreignField: '_id',
                    as: 'appointment'
                }
            },
            {
                $match: {
                    'appointment.specialty': specialty._id,
                    isVerified: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalReviews: { $sum: 1 },
                    averageRating: { $avg: '$rating' }
                }
            }
        ]);

        const stats = reviewStats[0] || { totalReviews: 0, averageRating: 0 };

        res.json({
            specialty: specialty.name,
            doctorsCount,
            appointmentsCount,
            totalReviews: stats.totalReviews,
            averageRating: Math.round(stats.averageRating * 10) / 10
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Route definitions
router.get('/', getSpecialties);
router.get('/:id', getSpecialtyById);
router.post('/', protect, admin, createSpecialty);
router.put('/:id', protect, admin, updateSpecialty);
router.delete('/:id', protect, admin, deleteSpecialty);
router.put('/:id/toggle-active', protect, admin, toggleSpecialtyActive);
router.get('/:id/stats', protect, admin, getSpecialtyStats);

module.exports = router;
