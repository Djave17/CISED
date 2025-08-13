const express = require('express');
const router = express.Router();
const { getReport, getFormStatistics } = require('../controllers/report.controller');

// Provide evaluation reports
router.get('/', getReport);

// Provide form statistics
router.get('/stats', getFormStatistics);

module.exports = router;
