const express = require('express');
const { getDailyReports } = require('../controllers/reportController');
const { protect, admin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/daily', protect, admin, getDailyReports);

module.exports = router;
