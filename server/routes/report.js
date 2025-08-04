const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { createReport } = require('../controllers/reportController');

// 🔐 Protect report route
router.use(requireAuth);

// 📩 Submit a report
router.post('/', createReport);

module.exports = router;
