const Availability = require('../models/Availability');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Create availability for a doctor
// @route   POST /api/availability
// @access  Private (Doctor only)
const createAvailability = async (req, res) => {
    try {
        const {
            date,
            startTime,
            endTime,
            slotDuration = 30,
            isRecurring = false,
            recurringPattern,
            recurringEndDate,
            maxAppointments = 1,
            location,
            consultationType = 'in-person'
        } = req.body;

        // Check if user is a doctor
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to create availability' });
        }

        const doctorId = req.user._id;

        // Check for conflicts
        const conflict = await Availability.findOne({
            doctor: doctorId,
            date,
            $or: [
                { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: 'Time slot already exists or conflicts with existing availability' });
        }

        let availabilities = [];

        if (isRecurring && recurringPattern && recurringEndDate) {
            // Create recurring availabilities
            const startDate = new Date(date);
            const endDate = new Date(recurringEndDate);
            let currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const availability = await Availability.create({
                    doctor: doctorId,
                    date: currentDate,
                    startTime,
                    endTime,
                    slotDuration,
                    isRecurring: true,
                    recurringPattern,
                    recurringEndDate,
                    maxAppointments,
                    location,
                    consultationType
                });
                availabilities.push(availability);

                // Move to next occurrence
                if (recurringPattern === 'daily') {
                    currentDate.setDate(currentDate.getDate() + 1);
                } else if (recurringPattern === 'weekly') {
                    currentDate.setDate(currentDate.getDate() + 7);
                } else if (recurringPattern === 'monthly') {
                    currentDate.setMonth(currentDate.getMonth() + 1);
                }
            }
        } else {
            // Create single availability
            const availability = await Availability.create({
                doctor: doctorId,
                date,
                startTime,
                endTime,
                slotDuration,
                isRecurring,
                recurringPattern,
                recurringEndDate,
                maxAppointments,
                location,
                consultationType
            });
            availabilities.push(availability);
        }

        res.status(201).json(availabilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor's availabilities
// @route   GET /api/availability/doctor/:doctorId
// @access  Public
const getDoctorAvailabilities = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { startDate, endDate } = req.query;

        let query = { doctor: doctorId, isActive: true };

        if (startDate && endDate) {
            query.date = {
                $gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        } else {
            query.date = { $gte: new Date(new Date().setHours(0, 0, 0, 0)) };
        }

        const availabilities = await Availability.find(query)
            .populate('doctor', 'name email specialty')
            .sort({ date: 1, startTime: 1 });

        res.json(availabilities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available time slots for a specific date
// @route   GET /api/availability/slots/:doctorId/:date
// @access  Public
const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date } = req.params;

        const availabilities = await Availability.find({
            doctor: doctorId,
            date: new Date(date),
            isActive: true
        });

        const appointments = await Appointment.find({
            doctor: doctorId,
            date: new Date(date),
            status: { $in: ['pending', 'confirmed'] }
        });

        const availableSlots = [];

        for (const availability of availabilities) {
            const slots = generateTimeSlots(
                availability.startTime,
                availability.endTime,
                availability.slotDuration
            );

            for (const slot of slots) {
                const isBooked = appointments.some(apt => apt.startTime === slot);
                const bookedCount = appointments.filter(apt => apt.startTime === slot).length;

                if (bookedCount < availability.maxAppointments) {
                    availableSlots.push({
                        time: slot,
                        available: availability.maxAppointments - bookedCount,
                        consultationType: availability.consultationType,
                        location: availability.location
                    });
                }
            }
        }

        res.json(availableSlots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update availability
// @route   PUT /api/availability/:id
// @access  Private (Doctor only)
const updateAvailability = async (req, res) => {
    try {
        const availability = await Availability.findById(req.params.id);

        if (!availability) {
            return res.status(404).json({ message: 'Availability not found' });
        }

        // Check ownership
        if (availability.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this availability' });
        }

        const updatedAvailability = await Availability.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedAvailability);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete availability
// @route   DELETE /api/availability/:id
// @access  Private (Doctor only)
const deleteAvailability = async (req, res) => {
    try {
        const availability = await Availability.findById(req.params.id);

        if (!availability) {
            return res.status(404).json({ message: 'Availability not found' });
        }

        // Check ownership
        if (availability.doctor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this availability' });
        }

        // Check if there are appointments for this availability
        const appointments = await Appointment.find({
            availability: availability._id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (appointments.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete availability with existing appointments' 
            });
        }

        await availability.remove();

        res.json({ message: 'Availability removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to generate time slots
const generateTimeSlots = (startTime, endTime, duration) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    while (start < end) {
        const slot = start.toTimeString().slice(0, 5);
        slots.push(slot);
        start.setMinutes(start.getMinutes() + duration);
    }
    
    return slots;
};

module.exports = {
    createAvailability,
    getDoctorAvailabilities,
    getAvailableSlots,
    updateAvailability,
    deleteAvailability
};
