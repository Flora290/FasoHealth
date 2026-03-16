const Appointment = require('../models/Appointment');
const User = require('../models/User');

// @desc    Get dashboard report stats (Admin only)
// @route   GET /api/reports/daily
// @access  Private (Admin)
const getDailyReports = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalAppointments = await Appointment.countDocuments();
        const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
        const validatedAppointments = await Appointment.countDocuments({ status: 'validated' });
        const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
        
        const todayAppointmentsCount = await Appointment.countDocuments({ date: { $gte: today } });
        const totalPatients = await User.countDocuments({ role: 'patient' });
        const totalDoctors = await User.countDocuments({ role: 'doctor' });

        res.json({
            totalAppointments,
            pendingAppointments,
            validatedAppointments,
            completedAppointments,
            todayAppointmentsCount,
            totalPatients,
            totalDoctors
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDailyReports
};
