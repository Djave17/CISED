const express = require('express');
const router = express.Router();
const { getReport } = require('../controllers/report.controller');

// Provide evaluation reports
router.get('/', getReport);

module.exports = router;
