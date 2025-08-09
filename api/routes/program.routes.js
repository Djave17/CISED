const express = require('express');
const router = express.Router();
const { createProgram } = require('../controllers/program.controller');

// Crear programa de evaluación
router.post('/', createProgram);

module.exports = router;
