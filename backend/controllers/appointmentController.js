const Appointment = require('../models/Appointment');
const Availability = require('../models/Availability');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private
const createAppointment = async (req, res) => {
    try {
        let {
            doctor,
            availability,
            date,
            startTime,
            endTime,
            reason,
            symptoms,
            urgency = 'medium',
            consultationType = 'in-person',
            notes
        } = req.body;

        // Map legacy consultation types if present
        if (consultationType === 'consultation') consultationType = 'in-person';
        if (consultationType === 'teleconsultation') consultationType = 'video';
        // 'phone' is now a valid consultationType, no mapping needed.

        // Verify doctor exists
        const doctorUser = await User.findById(doctor);
        if (!doctorUser || doctorUser.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Check availability exists and is available
        let availabilityDoc;
        if (availability) {
            availabilityDoc = await Availability.findById(availability);
        } else {
            // Fallback: try to find availability by doctor and date/time
            // Support both 'dateTime' (legacy) and individual date/startTime fields
            let searchDate = date;
            let searchStartTime = startTime;

            if (!searchDate && req.body.dateTime) {
                const dt = new Date(req.body.dateTime);
                searchDate = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
                searchStartTime = dt.toTimeString().slice(0, 5);
            }

            if (searchDate && searchStartTime) {
                availabilityDoc = await Availability.findOne({
                    doctor,
                    date: new Date(searchDate),
                    startTime: { $lte: searchStartTime },
                    endTime: { $gt: searchStartTime },
                    isActive: true
                });
            }
        }

        if (!availabilityDoc) {
            return res.status(404).json({ message: 'Availability not found or doctor not working at this time' });
        }

        const availabilityId = availabilityDoc._id;

        // Check if slot is still available
        const existingAppointments = await Appointment.find({
            availability: availabilityId,
            startTime: startTime || availabilityDoc.startTime,
            date: date || availabilityDoc.date,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (existingAppointments.length >= availabilityDoc.maxAppointments) {
            return res.status(400).json({ message: 'Time slot is no longer available' });
        }

        // Create appointment
        const appointment = await Appointment.create({
            patient: req.user._id,
            doctor,
            specialty: doctorUser.specialty,
            availability,
            date,
            startTime,
            endTime,
            reason,
            symptoms,
            urgency,
            consultationType,
            notes,
            payment: req.body.payment || { method: 'cash', status: 'pending' },
            timeSlot: startTime || undefined
        });

        // Populate appointment details
        const populatedAppointment = await Appointment.findById(appointment._id)
            .populate('patient', 'name email phoneNumber')
            .populate('doctor', 'name email specialty')
            .populate('specialty', 'name');

        // Create notification for doctor
        await Notification.create({
            recipient: doctor,
            type: 'appointment_pending',
            title: 'Nouveau rendez-vous',
            message: `Vous avez une nouvelle demande de rendez-vous avec ${req.user.name}`,
            data: {
                appointmentId: appointment._id,
                patientId: req.user._id
            },
            channels: {
                inApp: true,
                email: true
            }
        });

        // Create notification for patient
        await Notification.create({
            recipient: req.user._id,
            type: 'appointment_pending',
            title: 'Demande de rendez-vous envoyée',
            message: `Votre demande de rendez-vous avec le Dr ${doctorUser.name} a été envoyée`,
            data: {
                appointmentId: appointment._id,
                doctorId: doctor
            },
            channels: {
                inApp: true,
                email: true
            }
        });

        res.status(201).json(populatedAppointment);
    } catch (error) {
        console.error('CRITICAL ERROR in createAppointment:', error);
        res.status(500).json({ 
            message: 'Internal Server Error during appointment creation', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get user appointments
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
    try {
        const { status, startDate, endDate, page = 1, limit = 10, upcoming } = req.query;
        
        let query = {};
        
        // Filter by user role
        if (req.user.role === 'patient') {
            query.patient = req.user._id;
        } else if (req.user.role === 'doctor') {
            query.doctor = req.user._id;
        } else if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Additional filters
        if (status) query.status = status;
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        let sortOrder = { date: -1, startTime: -1 };

        if (upcoming === 'true') {
            // Only future/today appointments, sorted nearest first
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            if (!query.date) {
                query.date = { $gte: startOfDay };
            } else if (query.date.$gte && query.date.$gte < startOfDay) {
                query.date.$gte = startOfDay;
            }
            if (!query.status) {
                query.status = { $in: ['pending', 'confirmed'] };
            }
            sortOrder = { date: 1, startTime: 1 };
        }

        const appointments = await Appointment.find(query)
            .populate('patient', 'name email phoneNumber')
            .populate('doctor', 'name email specialty')
            .populate('specialty', 'name')
            .populate('availability', 'location consultationType')
            .sort(sortOrder)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Appointment.countDocuments(query);

        res.json({
            appointments,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error in getAppointments:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name email phoneNumber')
            .populate('doctor', 'name email specialty phoneNumber')
            .populate('specialty', 'name')
            .populate('availability', 'location consultationType');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check authorization
        if (
            appointment.patient._id.toString() !== req.user._id.toString() &&
            appointment.doctor._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ message: 'Not authorized to view this appointment' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment details (notes, diagnosis, symptoms)
// @route   PUT /api/appointments/:id
// @access  Private/Doctor
const updateAppointmentDetails = async (req, res) => {
    try {
        const { notes, diagnosis, symptoms } = req.body;
        
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Verify doctor owns this appointment
        if (appointment.doctor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized for this appointment' });
        }

        if (notes !== undefined) appointment.notes = notes;
        if (diagnosis !== undefined) appointment.diagnosis = diagnosis;
        if (symptoms !== undefined) appointment.symptoms = symptoms;

        const updatedAppointment = await appointment.save();
        res.json(updatedAppointment);
    } catch (error) {
        console.error('Error updating appointment details:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status, cancellationReason } = req.body;
        
        const appointment = await Appointment.findById(req.params.id)
            .populate('patient', 'name email')
            .populate('doctor', 'name email');

        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check authorization
        const isDoctor = appointment.doctor._id.toString() === req.user._id.toString();
        const isPatient = appointment.patient._id.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        // Validate status changes based on role
        if (status === 'confirmed' && !isDoctor && !isAdmin) {
            return res.status(403).json({ message: 'Only doctors can confirm appointments' });
        }

        if (status === 'cancelled' && !isDoctor && !isPatient && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
        }

        if (status === 'completed' && !isDoctor && !isAdmin) {
            return res.status(403).json({ message: 'Only doctors can mark appointments as completed' });
        }

        const previousStatus = appointment.status;
        appointment.status = status;

        if (status === 'cancelled') {
            appointment.cancellationReason = cancellationReason;
            appointment.cancelledBy = req.user._id;
        }

        const updatedAppointment = await appointment.save();

        // Create notifications based on status change
        if (previousStatus !== status) {
            let notificationType, title, message;

            switch (status) {
                case 'confirmed':
                    notificationType = 'appointment_confirmed';
                    title = 'Rendez-vous confirmé';
                    message = `Votre rendez-vous avec le Dr ${appointment.doctor.name} a été confirmé`;
                    break;
                case 'cancelled':
                    notificationType = 'appointment_cancelled';
                    title = 'Rendez-vous annulé';
                    message = `Le rendez-vous a été annulé: ${cancellationReason || 'Aucune raison spécifiée'}`;
                    break;
                case 'completed':
                    notificationType = 'appointment_completed';
                    title = 'Rendez-vous terminé';
                    message = `Votre rendez-vous avec le Dr ${appointment.doctor.name} est terminé`;
                    break;
            }

            // Notify patient
            if (isDoctor || isAdmin) {
                await Notification.create({
                    recipient: appointment.patient._id,
                    type: notificationType,
                    title,
                    message,
                    data: {
                        appointmentId: appointment._id,
                        doctorId: appointment.doctor._id
                    },
                    channels: {
                        inApp: true,
                        email: true
                    }
                });
            }

            // Notify doctor
            if (isPatient || isAdmin) {
                await Notification.create({
                    recipient: appointment.doctor._id,
                    type: notificationType,
                    title,
                    message,
                    data: {
                        appointmentId: appointment._id,
                        patientId: appointment.patient._id
                    },
                    channels: {
                        inApp: true,
                        email: true
                    }
                });
            }
        }

        res.json(updatedAppointment);
    } catch (error) {
        console.error('Error in updateAppointmentStatus:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper functions for backward compatibility
const getMyAppointments = async (req, res) => {
    req.query.page = req.query.page || 1;
    req.query.limit = req.query.limit || 10;
    return getAppointments(req, res);
};

const getDoctorAppointments = async (req, res) => {
    req.query.page = req.query.page || 1;
    req.query.limit = req.query.limit || 10;
    return getAppointments(req, res);
};

module.exports = {
    createAppointment,
    getAppointments,
    getAppointmentById,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    updateAppointmentDetails
};
