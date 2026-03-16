const Payment = require('../models/Payment');
const Appointment = require('../models/Appointment');

// @desc    Initiate mobile money payment
// @route   POST /api/payments/initiate
// @access  Private
const initiatePayment = async (req, res) => {
    try {
        const { appointmentId, provider, phoneNumber, amount } = req.body;

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Generate a mock transaction ID
        const transactionId = `FH-${provider.toUpperCase()}-${Date.now()}`;

        const payment = await Payment.create({
            appointment: appointmentId,
            user: req.user._id,
            amount,
            provider,
            phoneNumber,
            transactionId,
            status: 'pending'
        });

        // Simulate a payment gateway delay
        setTimeout(async () => {
            // Self-correcting: in a real app, this would be a webhook
            const updatedPayment = await Payment.findById(payment._id);
            if (updatedPayment) {
                updatedPayment.status = 'completed';
                updatedPayment.paymentDate = new Date();
                await updatedPayment.save();

                // Update appointment payment status
                appointment.payment.status = 'paid';
                appointment.payment.method = 'online';
                await appointment.save();
            }
        }, 5000);

        res.status(201).json({
            message: 'Payment initiated. Please confirm on your phone.',
            payment,
            transactionId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get payment status
// @route   GET /api/payments/:id
// @access  Private
const getPaymentStatus = async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all payments (Admin only)
// @route   GET /api/payments
// @access  Private/Admin
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find({})
            .populate('user', 'name email phoneNumber')
            .populate({
                path: 'appointment',
                populate: {
                    path: 'doctor',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    initiatePayment,
    getPaymentStatus,
    getAllPayments
};
