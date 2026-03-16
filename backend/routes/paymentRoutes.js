const express = require('express');
const { initiatePayment, getPaymentStatus, getAllPayments } = require('../controllers/paymentController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/initiate', protect, initiatePayment);
router.get('/', protect, admin, getAllPayments);
router.get('/:id', protect, getPaymentStatus);

module.exports = router;
