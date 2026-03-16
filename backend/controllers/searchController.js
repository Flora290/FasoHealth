const User = require('../models/User');
const Specialty = require('../models/Specialty');
const Availability = require('../models/Availability');
const Review = require('../models/Review');

// @desc    Search doctors by specialty, location, and filters
// @route   GET /api/search/doctors
// @access  Public
const searchDoctors = async (req, res) => {
    try {
        const {
            q,
            specialty,
            city,
            postalCode,
            consultationType,
            date,
            minRating = 0,
            maxPrice,
            page = 1,
            limit = 10
        } = req.query;

        let query = { role: 'doctor', isActive: true };

        // Generic search by name or specialty name
        if (q) {
            // First try to find a specialty with a matching name
            const matchingSpecialties = await Specialty.find({ 
                name: { $regex: q, $options: 'i' } 
            });
            const specialtyIds = matchingSpecialties.map(s => s._id);

            query.$or = [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ];

            if (specialtyIds.length > 0) {
                query.$or.push({ specialty: { $in: specialtyIds } });
            }
        }

        // Filter by specialty
        if (specialty) {
            query.specialty = specialty;
        }

        // Build location filter
        if (city || postalCode) {
            query.$or = [];
            if (city) {
                query.$or.push({ 'location.city': new RegExp(city, 'i') });
            }
            if (postalCode) {
                query.$or.push({ 'location.postalCode': postalCode });
            }
        }

        // Get doctors with basic info
        const doctors = await User.find(query)
            .select('name email specialty location phoneNumber consultationType')
            .populate('specialty', 'name icon color')
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Filter by consultation type if specified
        let filteredDoctors = doctors;
        if (consultationType) {
            filteredDoctors = doctors.filter(doctor => 
                doctor.consultationType && 
                (doctor.consultationType === consultationType || doctor.consultationType === 'both')
            );
        }

        // Get ratings for each doctor
        const doctorsWithRatings = await Promise.all(
            filteredDoctors.map(async (doctor) => {
                const reviews = await Review.find({ 
                    doctor: doctor._id, 
                    isVerified: true 
                });
                
                const averageRating = reviews.length > 0 
                    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
                    : 0;

                const totalReviews = reviews.length;

                // Filter by minimum rating
                if (averageRating < minRating) {
                    return null;
                }

                // Get availability for the specified date
                let availableSlots = [];
                if (date) {
                    const availabilities = await Availability.find({
                        doctor: doctor._id,
                        date: new Date(date),
                        isActive: true
                    });

                    for (const availability of availabilities) {
                        if (availability.consultationType === consultationType || 
                            availability.consultationType === 'both') {
                            availableSlots.push({
                                startTime: availability.startTime,
                                endTime: availability.endTime,
                                location: availability.location
                            });
                        }
                    }
                }

                return {
                    ...doctor.toObject(),
                    averageRating: Math.round(averageRating * 10) / 10,
                    totalReviews,
                    availableSlots: availableSlots.length
                };
            })
        );

        // Remove null entries (filtered out by rating)
        const finalDoctors = doctorsWithRatings.filter(doctor => doctor !== null);

        const total = await User.countDocuments(query);

        res.json({
            doctors: finalDoctors,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get doctor details with reviews
// @route   GET /api/search/doctors/:id
// @access  Public
const getDoctorDetails = async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id)
            .select('-password')
            .populate('specialty', 'name description icon color averageConsultationDuration typicalPriceRange');

        if (!doctor || doctor.role !== 'doctor') {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Get reviews
        const reviews = await Review.find({ 
            doctor: doctor._id, 
            isVerified: true 
        })
        .populate('patient', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

        // Calculate detailed ratings
        const averageRating = reviews.length > 0 
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
            : 0;

        const aspectRatings = {
            professionalism: 0,
            communication: 0,
            punctuality: 0,
            cleanliness: 0,
            effectiveness: 0
        };

        reviews.forEach(review => {
            if (review.aspects) {
                Object.keys(aspectRatings).forEach(aspect => {
                    if (review.aspects[aspect]) {
                        aspectRatings[aspect] += review.aspects[aspect];
                    }
                });
            }
        });

        Object.keys(aspectRatings).forEach(aspect => {
            aspectRatings[aspect] = reviews.length > 0 
                ? Math.round((aspectRatings[aspect] / reviews.length) * 10) / 10 
                : 0;
        });

        // Get upcoming availabilities
        const upcomingAvailabilities = await Availability.find({
            doctor: doctor._id,
            date: { $gte: new Date() },
            isActive: true
        })
        .sort({ date: 1, startTime: 1 })
        .limit(7);

        res.json({
            doctor: {
                ...doctor.toObject(),
                averageRating: Math.round(averageRating * 10) / 10,
                totalReviews: reviews.length,
                aspectRatings
            },
            reviews,
            upcomingAvailabilities
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specialties
// @route   GET /api/search/specialties
// @access  Public
const getSpecialties = async (req, res) => {
    try {
        const specialties = await Specialty.find({ isActive: true })
            .sort({ name: 1 });

        // Get doctor count for each specialty
        const specialtiesWithCount = await Promise.all(
            specialties.map(async (specialty) => {
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

        res.json(specialtiesWithCount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get available time slots for a doctor
// @route   GET /api/search/slots/:doctorId
// @access  Public
const getDoctorAvailableSlots = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, consultationType } = req.query;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const availabilities = await Availability.find({
            doctor: doctorId,
            date: new Date(date),
            isActive: true
        });

        const availableSlots = [];

        for (const availability of availabilities) {
            // Filter by consultation type
            if (consultationType && 
                availability.consultationType !== consultationType && 
                availability.consultationType !== 'both') {
                continue;
            }

            const slots = generateTimeSlots(
                availability.startTime,
                availability.endTime,
                availability.slotDuration
            );

            // Check which slots are available
            const Appointment = require('../models/Appointment');
            const appointments = await Appointment.find({
                doctor: doctorId,
                availability: availability._id,
                date: new Date(date),
                status: { $in: ['pending', 'confirmed'] }
            });

            for (const slot of slots) {
                const bookedCount = appointments.filter(apt => apt.startTime === slot).length;

                if (bookedCount < availability.maxAppointments) {
                    availableSlots.push({
                        time: slot,
                        available: availability.maxAppointments - bookedCount,
                        consultationType: availability.consultationType,
                        location: availability.location,
                        availabilityId: availability._id
                    });
                }
            }
        }

        res.json(availableSlots);
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
    searchDoctors,
    getDoctorDetails,
    getSpecialties,
    getDoctorAvailableSlots
};
